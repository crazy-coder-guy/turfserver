import * as slotService from './slot.service.js';
import { sendResponse, sendError } from '../../utils/response.js';

class SlotController {
  async getSlots(req, res, next) {
    try {
      const { date } = req.query;
      const turfId = req.params.id;
      
      const slots = await slotService.getSlotAvailability(turfId, date);
      
      if (slots.error) {
        return sendError(res, slots.error.code, slots.error.message);
      }

      return sendResponse(res, 200, 'Slots fetched successfully', slots);
    } catch (error) {
      next(error);
    }
  }

  async blockSlot(req, res, next) {
    try {
      const turfId = req.params.id;
      const ownerId = req.user.id;
      
      const block = await slotService.blockSlots(turfId, req.body, ownerId);
      
      if (block.error) {
        return sendError(res, block.error.code, block.error.message);
      }

      return sendResponse(res, 201, 'Slot created successfully', block);
    } catch (error) {
      next(error);
    }
  }

  async unblockSlot(req, res, next) {
    try {
      const { blockId } = req.params;
      const ownerId = req.user.id;
      
      const result = await slotService.unblockSlots(blockId, ownerId);
      
      if (result.error) {
        return sendError(res, result.error.code, result.error.message);
      }

      return sendResponse(res, 200, 'Slot removed successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSlotStatus(req, res, next) {
    try {
      const { slotId } = req.params;
      const { type } = req.body;
      const ownerId = req.user.id;
      
      const result = await slotService.updateSlotStatus(slotId, type, ownerId);
      
      if (result.error) {
        return sendError(res, result.error.code, result.error.message);
      }
 
      return sendResponse(res, 200, `Slot status updated to ${type}`, result);
    } catch (error) {
      next(error);
    }
  }

  async getBlocks(req, res, next) {
    try {
      const turfId = req.params.id;
      const { date } = req.query;
      
      const blocks = await slotService.getBlockedSlots(turfId, date);
      return sendResponse(res, 200, 'Blocked slots fetched successfully', blocks);
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req, res, next) {
    try {
      const turfId = req.params.id;
      const booking = await slotService.createBooking(turfId, req.body);
      
      if (booking.error) {
        return sendError(res, booking.error.code, booking.error.message);
      }

      return sendResponse(res, 201, 'Booking created successfully', booking);
    } catch (error) {
      next(error);
    }
  }
}

export default new SlotController();
