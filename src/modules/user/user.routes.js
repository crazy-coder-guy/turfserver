import express from 'express';
import userController from './user.controller.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get('/me', protect, userController.getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', protect, userController.updateMe);

/**
 * @swagger
 * /users/discover:
 *   get:
 *     summary: Discover other users to follow
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users discovered
 */
router.get('/discover', protect, userController.discoverUsers);

/**
 * @swagger
 * /users/friends:
 *   get:
 *     summary: Get current user's friends (following)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friends retrieved
 */
router.get('/friends', protect, userController.getMyFriends);

/**
 * @swagger
 * /users/follow/{userId}:
 *   post:
 *     summary: Follow another user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followed successfully
 */
router.post('/follow/:userId', protect, userController.followUser);

export default router;
