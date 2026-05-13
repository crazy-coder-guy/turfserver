import Joi from 'joi';

export const createOrderSchema = Joi.object({
  turf_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  slot_id: Joi.string().guid({ version: 'uuidv4' }),
  date: Joi.string(),
  start_time: Joi.string(),
  end_time: Joi.string(),
});

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

export const submitReviewSchema = Joi.object({
  booking_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('', null).max(1000),
});
