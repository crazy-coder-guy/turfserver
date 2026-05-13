import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import turfRoutes from '../modules/turf/turf.routes.js';
import slotRoutes from '../modules/slot/slot.routes.js';
import bookingRoutes from '../modules/booking/booking.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/turfs', turfRoutes);
router.use('/turfs', slotRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);

export default router;
