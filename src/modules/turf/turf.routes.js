import express from 'express';
import turfController from './turf.controller.js';
import { createTurfSchema, updateTurfSchema } from './turf.validation.js';
import { validateRequest } from '../../utils/validator.js';
import { protect } from '../auth/auth.middleware.js';
import { upload } from '../../config/s3.js';

const router = express.Router();

/**
 * @swagger
 * /turfs:
 *   post:
 *     summary: Create a new turf
 *     tags: [Turfs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', protect, validateRequest(createTurfSchema), turfController.createTurf);

/**
 * @swagger
 * /turfs/public:
 *   get:
 *     summary: List all active turfs for public browsing
 *     tags: [Turfs]
 */
router.get('/public', turfController.getPublicTurfs);

/**
 * @swagger
 * /turfs/search:
 *   get:
 *     summary: Global search for turfs by name, city, address or sport
 *     tags: [Turfs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', turfController.searchTurfs);

/**
 * @swagger
 * /turfs/nearby:
 *   get:
 *     summary: Get nearby turfs within a radius
 *     tags: [Turfs]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *     responses:
 *       200:
 *         description: Nearby turfs retrieved successfully
 */
router.get('/nearby', turfController.getNearbyTurfs);

/**
 * @swagger
 * /turfs/public/{id}:
 *   get:
 *     summary: Get public turf details
 *     tags: [Turfs]
 */
router.get('/public/:id', turfController.getPublicTurfById);
router.get('/public/:id/slots', turfController.getTurfSlots);
router.get('/public/:id/reviews', turfController.getTurfReviews);

/**
 * @swagger
 * /turfs:
 *   get:
 *     summary: List all turfs (Owner sees own, Admin sees all)
 *     tags: [Turfs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, turfController.getAllTurfs);

/**
 * @swagger
 * /turfs/{id}:
 *   get:
 *     summary: Get turf details
 *     tags: [Turfs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', protect, turfController.getTurfById);

/**
 * @swagger
 * /turfs/{id}:
 *   put:
 *     summary: Update turf details
 *     tags: [Turfs]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', protect, validateRequest(updateTurfSchema), turfController.updateTurf);

/**
 * @swagger
 * /turfs/upload-images:
 *   post:
 *     summary: Upload turf images (max 3)
 *     tags: [Turfs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/upload-images', protect, upload.array('images', 3), turfController.uploadTurfImages);

export default router;
