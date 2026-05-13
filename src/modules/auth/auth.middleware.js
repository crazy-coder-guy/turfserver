import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { sendError } from '../../utils/response.js';

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, env.JWT.SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    return sendError(res, 401, 'Token is invalid or expired');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};
