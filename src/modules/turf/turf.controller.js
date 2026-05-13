import turfService from './turf.service.js';
import { sendResponse, sendError } from '../../utils/response.js';

class TurfController {
  async createTurf(req, res, next) {
    try {
      const turf = await turfService.createTurf(req.user.id, req.body);
      return sendResponse(res, 201, 'Turf created successfully', turf);
    } catch (error) {
      next(error);
    }
  }

  async getAllTurfs(req, res, next) {
    try {
      const data = await turfService.getAllTurfs(req.query, req.user);
      return sendResponse(res, 200, 'Turfs retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getPublicTurfs(req, res, next) {
    try {
      const data = await turfService.getPublicTurfs(req.query);
      return sendResponse(res, 200, 'Public turfs retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async searchTurfs(req, res, next) {
    try {
      const data = await turfService.searchTurfs(req.query);
      return sendResponse(res, 200, 'Turfs searched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyTurfs(req, res, next) {
    try {
      const data = await turfService.getNearbyTurfs(req.query);
      return sendResponse(res, 200, 'Nearby turfs retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getPublicTurfById(req, res, next) {
    try {
      const turf = await turfService.getPublicTurfById(req.params.id);
      return sendResponse(res, 200, 'Public turf details retrieved', turf);
    } catch (error) {
      next(error);
    }
  }

  async getTurfById(req, res, next) {
    try {
      const turf = await turfService.getTurfById(req.params.id, req.user);
      return sendResponse(res, 200, 'Turf details retrieved', turf);
    } catch (error) {
      next(error);
    }
  }

  async updateTurf(req, res, next) {
    try {
      const turf = await turfService.updateTurf(req.params.id, req.user.id, req.body);
      return sendResponse(res, 200, 'Turf updated successfully', turf);
    } catch (error) {
      next(error);
    }
  }

  async uploadTurfImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return sendError(res, 400, 'No images uploaded');
      }

      if (req.files.length > 3) {
        return sendError(res, 400, 'Maximum 3 images allowed');
      }

      const imageUrls = req.files.map(file => file.location);
      return sendResponse(res, 200, 'Images uploaded successfully', { urls: imageUrls });
    } catch (error) {
      next(error);
    }
  }

  async getTurfSlots(req, res, next) {
    try {
      const data = await turfService.getTurfSlots(req.params.id, req.query.date);
      return sendResponse(res, 200, 'Turf slots retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getTurfReviews(req, res, next) {
    try {
      const data = await turfService.getTurfReviews(req.params.id);
      return sendResponse(res, 200, 'Turf reviews retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

export default new TurfController();
