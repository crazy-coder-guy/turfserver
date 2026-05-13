
import express from 'express';
import notificationController from './notification.controller.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

router.use(protect); // All notification routes are protected

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);

export default router;
