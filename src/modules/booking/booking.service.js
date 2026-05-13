import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Op } from 'sequelize';
import UserBooking from '../../models/userBooking.model.js';
import Slot from '../../models/slot.model.js';
import Turf from '../../models/turf.model.js';
import Review from '../../models/review.model.js';
import User from '../../models/user.model.js';
import BookingParticipant from '../../models/bookingParticipant.model.js';
import sequelize from '../../config/db.js';
import { env } from '../../config/env.js';
import NotificationService from '../notification/notification.service.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY.KEY_ID,
  key_secret: env.RAZORPAY.KEY_SECRET,
});

class BookingService {
  /**
   * Create a new booking order with Razorpay
   */
  async createBookingOrder(userId, bookingData) {
    const { slot_id, turf_id, date, start_time, end_time } = bookingData;

    let slot;
    const turf = await Turf.findByPk(turf_id);
    if (!turf) throw new Error('Turf not found');

    let totalAmount = 0;
    if (slot_id) {
      slot = await Slot.findByPk(slot_id);
      totalAmount = slot ? (typeof slot.price === 'string' ? parseFloat(slot.price.replace(/[^0-9.]/g, '')) : parseFloat(slot.price || 0)) : 0;
    } else if (date && start_time && end_time) {
      // Create all 30-min slots in the range if they don't exist
      // Using string-based arithmetic to avoid Date object timezone issues
      const timeToMins = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const minsToTime = (m) => {
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:00`;
      };

      let currentMins = timeToMins(start_time);
      const endMins = timeToMins(end_time);
      let slotCount = 0;

      while (currentMins < endMins) {
        const nextMins = currentMins + 30;
        const sTime = minsToTime(currentMins);
        const eTime = minsToTime(nextMins);

        const [s] = await Slot.findOrCreate({
          where: {
            turf_id: turf_id,
            slot_date: date,
            start_time: sTime,
          },
          defaults: {
            end_time: eTime,
            type: 'available',
            price: turf.price ? (parseFloat(turf.price.toString().replace(/[^0-9.]/g, '')) / 2) : 400
          }
        });
        
        if (!slot) slot = s;
        slotCount++;
        currentMins = nextMins;
      }
      
      const hourlyPrice = typeof turf.price === 'string' ? parseFloat(turf.price.replace(/[^0-9.]/g, '')) : parseFloat(turf.price || 800);
      totalAmount = (hourlyPrice / 2) * slotCount;
    }

    if (!slot) throw new Error('Slot information missing');
    if (slot.type !== 'available') throw new Error('Slot is no longer available');

    if (!totalAmount || isNaN(totalAmount)) throw new Error('Booking price not defined');

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 3. Create Pending Booking in Database
    const booking = await UserBooking.create({
      user_id: userId,
      turf_id: turf.id,
      slot_id: slot.id,
      booking_date: date || slot.slot_date,
      start_time: start_time || slot.start_time,
      end_time: end_time || slot.end_time,
      total_price: totalAmount,
      status: 'pending',
      payment_status: 'unpaid',
      razorpay_order_id: order.id,
    });

    // 4. Handle Group Booking / Participants
    if (bookingData.participants && Array.isArray(bookingData.participants) && bookingData.participants.length > 0) {
      const captain = await User.findByPk(userId);
      const perPersonAmount = totalAmount / (bookingData.participants.length + 1);
      
      const participantRecords = bookingData.participants.map(p => ({
        booking_id: booking.id,
        user_id: p.id || p.user_id,
        share_amount: perPersonAmount,
        status: 'paid' // Mark as paid as they confirmed in the split UI
      }));
      
      await BookingParticipant.bulkCreate(participantRecords);
      
      // Notify teammates
      for (const p of participantRecords) {
        NotificationService.sendTeamInvitation(p.user_id, {
          captainName: captain ? captain.name : 'Your teammate',
          turfName: turf.name,
          shareAmount: perPersonAmount,
          bookingId: booking.id
        });
      }
    }

    return {
      order_id: order.id,
      amount: options.amount,
      currency: options.currency,
      booking_id: booking.id,
    };
  }

  /**
   * Verify Razorpay payment and confirm booking
   */
  async verifyPayment(paymentData) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = paymentData;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY.KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // 2. Update Database (Atomic Transaction)
    const transaction = await sequelize.transaction();

    try {
      const booking = await UserBooking.findOne({
        where: { razorpay_order_id },
        transaction,
      });

      if (!booking) throw new Error('Booking not found for this order');
      if (booking.status === 'confirmed') return booking; // Already processed

      // Update Booking
      await booking.update({
        status: 'confirmed',
        payment_status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
        payment_method: 'razorpay', // We can get more details from razorpay API if needed
      }, { transaction });

      // Update All Slots in the range
      console.log(`DEBUG: Updating slots for turf ${booking.turf_id} on ${booking.booking_date} between ${booking.start_time} and ${booking.end_time}`);
      
      const slotsInRange = await Slot.findAll({
        where: {
          turf_id: booking.turf_id,
          slot_date: booking.booking_date,
          [Op.and]: [
            { start_time: { [Op.gte]: booking.start_time } },
            { start_time: { [Op.lt]: booking.end_time } }
          ]
        },
        transaction
      });
      
      console.log(`DEBUG: Found ${slotsInRange.length} slots in range: ${slotsInRange.map(s => s.start_time).join(', ')}`);

      const [updatedCount] = await Slot.update({
        type: 'booked',
        user_id: booking.user_id,
      }, {
        where: {
          id: { [Op.in]: slotsInRange.map(s => s.id) }
        },
        transaction 
      });

      console.log(`DEBUG: Marked ${updatedCount} slots as booked for booking ${booking.id}`);

      await transaction.commit();
      
      // Send notification (async, don't wait for it to finish to return response)
      NotificationService.sendBookingConfirmation(booking.user_id, booking);

      return booking;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Fetch bookings for a specific user
   */
  async getUserBookings(userId, query) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { count, rows } = await UserBooking.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Turf,
          attributes: ['name', 'address', 'city', 'images', 'sport_type'],
        },
        {
          model: Review,
          attributes: ['rating', 'comment', 'created_at'],
        },
        {
          model: BookingParticipant,
          include: [{ model: User, attributes: ['name', 'profile_image_url'] }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      bookings: rows,
    };
  }

  /**
   * Create a review for a booking
   */
  async createReview(userId, reviewData) {
    const { booking_id, rating, comment } = reviewData;

    // 1. Check if booking exists and belongs to user
    const booking = await UserBooking.findOne({
      where: { id: booking_id, user_id: userId }
    });

    if (!booking) {
      throw new Error('Booking not found or you do not have permission to review it');
    }

    // 2. Check if booking is completed (or at least confirmed/paid)
    if (booking.payment_status !== 'paid') {
      throw new Error('You can only review paid bookings');
    }

    // 3. Check if already reviewed
    const existingReview = await Review.findOne({
      where: { booking_id }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this booking');
    }

    // 4. Create review
    const transaction = await sequelize.transaction();
    try {
      const review = await Review.create({
        user_id: userId,
        turf_id: booking.turf_id,
        booking_id,
        rating,
        comment
      }, { transaction });

      // 5. Update Turf Stats
      const turf = await Turf.findByPk(booking.turf_id, { transaction });
      if (turf) {
        const totalReviews = await Review.count({ 
          where: { turf_id: booking.turf_id },
          transaction 
        });
        
        const avgRatingResponse = await Review.findAll({
          where: { turf_id: booking.turf_id },
          attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
          transaction
        });
        
        const avgRating = parseFloat(avgRatingResponse[0].dataValues.avgRating || rating);

        await turf.update({
          rating: avgRating,
          total_reviews: totalReviews
        }, { transaction });
      }

      await transaction.commit();
      return review;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  /**
   * Add teammates to an existing booking
   */
  async addTeammates(userId, bookingId, participants, isSplitEnabled = false) {
    // 1. Check if booking exists and belongs to user
    const booking = await UserBooking.findByPk(bookingId, {
      include: [{ model: Turf, attributes: ['name'] }]
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.user_id !== userId) throw new Error('You do not have permission to modify this booking');

    const turf = booking.Turf;
    const captain = await User.findByPk(userId);
    const existingParticipants = await BookingParticipant.count({ where: { booking_id: bookingId } });
    const totalPeople = existingParticipants + participants.length + 1; 
    
    let perPersonAmount = 0;
    if (isSplitEnabled) {
      perPersonAmount = parseFloat(booking.total_price) / totalPeople;
    }

    // 3. Create new participant records
    const participantRecords = participants.map(p => ({
      booking_id: bookingId,
      user_id: p.id || p.user_id,
      share_amount: perPersonAmount,
      status: isSplitEnabled ? 'pending' : 'confirmed'
    }));

    await BookingParticipant.bulkCreate(participantRecords);

    // 4. Update existing participants' share amount if split enabled
    if (isSplitEnabled) {
      await BookingParticipant.update(
        { share_amount: perPersonAmount },
        { where: { booking_id: bookingId } }
      );
    }

    // 5. Notify new teammates (only if split enabled or just a social notification)
    for (const p of participantRecords) {
      if (isSplitEnabled) {
        NotificationService.sendTeamInvitation(p.user_id, {
          captainName: captain ? captain.name : 'Your teammate',
          turfName: turf ? turf.name : 'The turf',
          shareAmount: perPersonAmount,
          bookingId: bookingId
        });
      } else {
        // Send a simple "Added to squad" notification if you have one, 
        // or reuse the invitation with 0 amount
        console.log(`Social addition: User ${p.user_id} added to booking ${bookingId}`);
      }
    }

    return {
      success: true,
      perPersonAmount,
      totalParticipants: totalPeople
    };
  }
}

export default new BookingService();
