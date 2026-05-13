import Joi from 'joi';

export const createTurfSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().allow('', null),
  sport_type: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  images: Joi.array().items(Joi.string()).max(3).default([]),
  start_time: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).required(), // HH:mm format
  end_time: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  email: Joi.string().email().allow(null, ''),
  whatsapp_number: Joi.string().allow(null, ''),
  contact_number: Joi.string().allow(null, ''),
  amenities: Joi.array().items(Joi.string()).allow(null),
});

export const updateTurfSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().allow('', null),
  sport_type: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  pincode: Joi.string(),
  images: Joi.array().items(Joi.string()).max(3),
  start_time: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
  end_time: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
});
