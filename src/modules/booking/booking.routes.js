import express from 'express';
import bookingController from './booking.controller.js';
import { createOrderSchema, verifyPaymentSchema, submitReviewSchema } from './booking.validation.js';
import { validateRequest } from '../../utils/validator.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /bookings/create-order:
 *   post:
 *     summary: Initiate a booking by creating a Razorpay order
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/create-order', protect, validateRequest(createOrderSchema), bookingController.createOrder);

/**
 * @swagger
 * /bookings/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment and confirm booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/verify-payment', protect, validateRequest(verifyPaymentSchema), bookingController.verifyPayment);

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-bookings', protect, bookingController.getUserBookings);

/**
 * @swagger
 * /bookings/review:
 *   post:
 *     summary: Submit a review for a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/review', protect, validateRequest(submitReviewSchema), bookingController.submitReview);

/**
 * @swagger
 * /bookings/add-teammates:
 *   post:
 *     summary: Add teammates to an existing booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.post('/add-teammates', protect, bookingController.addTeammates);

export default router;
