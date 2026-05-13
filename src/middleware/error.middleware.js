import { sendError } from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  } else if (err.message === 'Invalid email or password') {
    statusCode = 401;
    message = err.message;
  } else if (err.message.includes('not active')) {
    statusCode = 403;
    message = err.message;
  }

  return sendError(res, statusCode, message);
};

export default errorHandler;
