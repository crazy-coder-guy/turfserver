import Joi from 'joi';

export const getSlotsSchema = {
  query: Joi.object().keys({
    date: Joi.string().required().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format'
    }),
  }),
};

export const blockSlotSchema = {
  body: Joi.object().keys({
    date: Joi.string().required().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: Joi.string().required().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    end_time: Joi.string().required().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    reason: Joi.string().allow(null, ''),
    price: Joi.number().allow(null),
  }),
};

export const unblockSlotSchema = {
  params: Joi.object().keys({
    blockId: Joi.string().required().uuid(),
  }),
};
