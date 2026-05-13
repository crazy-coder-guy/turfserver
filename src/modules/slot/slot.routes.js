import express from 'express';
import { validateRequest } from '../../utils/validator.js';
import { protect } from '../auth/auth.middleware.js';
import slotController from './slot.controller.js';
import * as slotValidation from './slot.validation.js';

const router = express.Router();

// Publicly viewable slots
router.get('/:id/slots', 
  validateRequest(slotValidation.getSlotsSchema), 
  slotController.getSlots
);

// Manage blocks (Requires authentication)
router.get('/:id/blocks', 
  protect,
  slotController.getBlocks
);

router.post('/:id/block', 
  protect,
  validateRequest(slotValidation.blockSlotSchema), 
  slotController.blockSlot
);

router.post('/:id/booking',
  protect,
  slotController.createBooking
);

router.delete('/unblock/:blockId', 
  protect,
  validateRequest(slotValidation.unblockSlotSchema), 
  slotController.unblockSlot
);

router.patch('/status/:slotId',
  protect,
  slotController.updateSlotStatus
);

export default router;
