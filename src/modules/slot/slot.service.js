import { Op } from 'sequelize';
import Slot from '../../models/slot.model.js';
import Turf from '../../models/turf.model.js';

/**
 * Generate dynamic slots for a turf on a specific date
 */
export const generateSlots = async (turfId, date) => {
  const turf = await Turf.findByPk(turfId);
  if (!turf) {
    return { error: { code: 404, message: 'Turf not found' } };
  }

  const { start_time, end_time, slot_duration = 60, price: turfPrice } = turf;

  const slots = [];
  let current = new Date(`${date}T${start_time}`);
  const end = new Date(`${date}T${end_time}`);

  // Handle cross-day scenario if end_time < start_time
  if (end <= current) {
    end.setDate(end.getDate() + 1);
  }

  while (current < end) {
    const slotStart = current.toTimeString().slice(0, 5);
    const next = new Date(current.getTime() + (slot_duration || 60) * 60000);

    if (next > end) break;

    const slotEnd = next.toTimeString().slice(0, 5);

    slots.push({
      start_time: slotStart,
      end_time: slotEnd,
      status: 'available',
      price: turfPrice
    });

    current = next;
  }

  return { turf, slots };
};

export const getSlotAvailability = async (turfId, date) => {
  // Fetch all slots from DB for this date (bookings and blocks)
  const dbSlots = await Slot.findAll({
    where: {
      turf_id: turfId,
      slot_date: date
    },
    order: [['start_time', 'ASC']]
  });

  // Map to the format expected by the frontend
  return dbSlots.map(slot => ({
    id: slot.id,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: slot.type, // 'booked' or 'blocked'
    price: slot.price,
    reason: slot.reason
  }));
};

/**
 * Block a specific slot range
 */
export const blockSlots = async (turfId, data, ownerId) => {
  const { date, start_time, end_time, reason, price } = data;

  // Check for overlaps
  const overlap = await Slot.findOne({
    where: {
      turf_id: turfId,
      slot_date: date,
      [Op.and]: [
        {
          start_time: { [Op.lt]: end_time }
        },
        {
          end_time: { [Op.gt]: start_time }
        }
      ]
    }
  });

  if (overlap) {
    return { error: { code: 400, message: 'Time range overlaps with an existing entry' } };
  }

  return await Slot.create({
    turf_id: turfId,
    slot_date: date,
    start_time,
    end_time,
    type: data.type || 'available',
    reason,
    price,
    created_by: ownerId
  });
};

/**
 * Unblock a specific slot
 */
export const unblockSlots = async (blockId, ownerId) => {
  const slot = await Slot.findByPk(blockId);
  if (!slot) {
    return { error: { code: 404, message: 'Slot record not found' } };
  }

  // Permission check
  if (slot.created_by !== ownerId) {
    return { error: { code: 403, message: 'You do not have permission to modify this slot' } };
  }

  await slot.destroy();
  return true;
};

/**
 * Update slot type (toggle between available and blocked)
 */
export const updateSlotStatus = async (slotId, type, ownerId) => {
  const slot = await Slot.findByPk(slotId);
  if (!slot) {
    return { error: { code: 404, message: 'Slot record not found' } };
  }

  // Permission check
  if (slot.created_by !== ownerId) {
    return { error: { code: 403, message: 'You do not have permission to modify this slot' } };
  }

  slot.type = type;
  await slot.save();
  return slot;
};

/**
 * Get all database slots for a turf and date
 */
export const getBlockedSlots = async (turfId, date) => {
  return await Slot.findAll({
    where: {
      turf_id: turfId,
      slot_date: date,
      type: 'blocked'
    },
    order: [['start_time', 'ASC']]
  });
};

/**
 * Create a manual booking
 */
export const createBooking = async (turfId, data) => {
  const { date, start_time, end_time, price, user_id = null } = data;

  // Check for overlaps
  const overlap = await Slot.findOne({
    where: {
      turf_id: turfId,
      slot_date: date,
      [Op.and]: [
        {
          start_time: { [Op.lt]: end_time }
        },
        {
          end_time: { [Op.gt]: start_time }
        }
      ]
    }
  });

  if (overlap) {
    return { error: { code: 400, message: 'Time range overlaps with an existing entry' } };
  }

  return await Slot.create({
    turf_id: turfId,
    slot_date: date,
    start_time,
    end_time,
    type: 'booked',
    price,
    user_id
  });
};
