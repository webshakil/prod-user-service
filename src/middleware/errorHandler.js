import logger from '../utils/logger.js';
import { sendError } from '../utils/responseFormatter.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400);
  }

  return sendError(res, err.message || 'Internal server error', 500);
};

export default errorHandler;