import cron from 'node-cron';
import { Op } from 'sequelize';
import UserBooking from '../../models/userBooking.model.js';
import NotificationService from '../notification/notification.service.js';
import Turf from '../../models/turf.model.js';
import moment from 'moment';

class BookingReminderService {
  init() {
    // Run every 1 minute
    cron.schedule('* * * * *', () => {
      this.checkAndSendReminders();
      this.checkAndSendReviewReminders();
    });
    console.log('Booking Reminder & Review Job Scheduled (Every 1 min) ⏰');
  }

  async checkAndSendReminders() {
    try {
      const now = moment();
      const thirtyMinsFromNow = moment().add(30, 'minutes').format('HH:mm:ss');
      const timeNow = now.format('HH:mm:ss');
      const today = now.format('YYYY-MM-DD');

      console.log(`Checking for unsent start reminders for bookings between ${timeNow} and ${thirtyMinsFromNow} on ${today}`);

      const upcomingBookings = await UserBooking.findAll({
        where: {
          status: 'confirmed',
          reminder_sent: false,
          booking_date: today,
          start_time: {
            [Op.gte]: timeNow,
            [Op.lte]: thirtyMinsFromNow
          }
        },
        include: [{ model: Turf, attributes: ['name', 'address'] }],
        limit: 100
      });

      if (upcomingBookings.length > 0) {
        console.log(`Found ${upcomingBookings.length} upcoming bookings for start reminders. Processing...`);
        await Promise.all(upcomingBookings.map(async (booking) => {
          try {
            const title = 'Upcoming Match Alert! ⚽';
            const message = `Friendly reminder: Your booking at ${booking.Turf?.name || 'the turf'} starts in 30 minutes (${booking.start_time}). Don't be late!`;

            await NotificationService.sendToUser(booking.user_id, {
              title,
              message,
              type: 'booking_reminder',
              data: { booking_id: booking.id, turf_id: booking.turf_id }
            });

            booking.reminder_sent = true;
            await booking.save();
          } catch (e) { console.error('Error in Start Reminder:', e); }
        }));
      }
    } catch (error) {
      console.error('Error in Start Reminder Job:', error);
    }
  }

  async checkAndSendReviewReminders() {
    try {
      const now = moment();
      const threeMinsAgo = moment().subtract(3, 'minutes').format('HH:mm:ss');
      const today = now.format('YYYY-MM-DD');

      // We look for matches that ended between today's start and 3 mins ago
      // that are confirmed/paid but haven't been asked for a review yet
      console.log(`Checking for review reminders for matches that ended before ${threeMinsAgo} on ${today}`);

      const completedBookings = await UserBooking.findAll({
        where: {
          status: 'confirmed',
          review_reminder_sent: false,
          booking_date: today,
          end_time: {
            [Op.lte]: threeMinsAgo
          }
        },
        include: [{ model: Turf, attributes: ['name'] }],
        limit: 100
      });

      if (completedBookings.length > 0) {
        console.log(`Found ${completedBookings.length} completed bookings for review reminders. Processing...`);
        await Promise.all(completedBookings.map(async (booking) => {
          try {
            const title = 'How was the match? ⚽⭐';
            const message = `We hope you enjoyed your game at ${booking.Turf?.name || 'the turf'}. Rate your experience now!`;

            await NotificationService.sendToUser(booking.user_id, {
              title,
              message,
              type: 'review_reminder',
              data: { booking_id: booking.id, turf_id: booking.turf_id }
            });

            booking.review_reminder_sent = true;
            await booking.save();
          } catch (e) { console.error('Error in Review Reminder:', e); }
        }));
      }
    } catch (error) {
      console.error('Error in Review Reminder Job:', error);
    }
  }
}

export default new BookingReminderService();
