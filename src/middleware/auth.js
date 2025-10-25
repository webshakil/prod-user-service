import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import logger from '../utils/logger.js';
import { sendError } from '../utils/responseFormatter.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    req.user = decoded;

    logger.debug('Token verified', { userId: decoded.userId });
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.userId;
      req.user = decoded;
    }
    next();
  } catch (error) {
    next();
  }
};