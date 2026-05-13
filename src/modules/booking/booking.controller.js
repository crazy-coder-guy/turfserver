import bookingService from './booking.service.js';

class BookingController {
  /**
   * Initiate a booking by creating a Razorpay order
   */
  async createOrder(req, res, next) {
    try {
      const orderData = await bookingService.createBookingOrder(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Order initiated successfully',
        data: orderData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Razorpay payment and confirm booking
   */
  async verifyPayment(req, res, next) {
    try {
      const booking = await bookingService.verifyPayment(req.body);
      res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all bookings for the logged-in user
   */
  async getUserBookings(req, res, next) {
    try {
      const bookings = await bookingService.getUserBookings(req.user.id, req.query);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit a review for a booking
   */
  async submitReview(req, res, next) {
    try {
      const review = await bookingService.createReview(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Add teammates to an existing booking
   */
  async addTeammates(req, res, next) {
    try {
      const { booking_id, participants, is_split_enabled } = req.body;
      const result = await bookingService.addTeammates(req.user.id, booking_id, participants, is_split_enabled);
      res.status(200).json({
        success: true,
        message: 'Teammates added and requests sent',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingController();
