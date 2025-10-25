import { sendSuccess, sendError } from '../utils/responseFormatter.js';
import * as userService from '../services/userService.js';
import logger from '../utils/logger.js';

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return sendError(res, 'User ID required', 400);
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    logger.info('User retrieved', { userId });
    return sendSuccess(res, user, 'User retrieved');
  } catch (error) {
    logger.error('Error retrieving user', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

export const getCompleteUserData = async (req, res) => {
  try {
    // Get userId from request body (sent from frontend)
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 'User ID required in request body', 400);
    }

    const data = await userService.getCompleteUserData(userId);

    if (!data) {
      return sendError(res, 'User not found', 404);
    }

    logger.info('Complete user data retrieved', { userId });
    return sendSuccess(res, data, 'User data retrieved');
  } catch (error) {
    logger.error('Error retrieving user data', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return sendError(res, 'Search query required', 400);
    }

    const results = await userService.searchUsers(q, parseInt(limit), parseInt(offset));

    logger.info('Users searched', { query: q, count: results.length });
    return sendSuccess(res, results, 'Search results');
  } catch (error) {
    logger.error('Error searching users', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

// import { sendSuccess, sendError } from '../utils/responseFormatter.js';
// import * as userService from '../services/userService.js';
// import logger from '../utils/logger.js';

// export const getUserById = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const user = await userService.getUserById(userId);

//     if (!user) {
//       return sendError(res, 'User not found', 404);
//     }

//     logger.info('User retrieved', { userId });
//     return sendSuccess(res, user, 'User retrieved');
//   } catch (error) {
//     logger.error('Error retrieving user', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };

// export const getCompleteUserData = async (req, res) => {
//   try {
//     const userId = req.userId;

//     if (!userId) {
//       return sendError(res, 'Unauthorized', 401);
//     }

//     const data = await userService.getCompleteUserData(userId);

//     if (!data) {
//       return sendError(res, 'User not found', 404);
//     }

//     logger.info('Complete user data retrieved', { userId });
//     return sendSuccess(res, data, 'User data retrieved');
//   } catch (error) {
//     logger.error('Error retrieving user data', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };

// export const searchUsers = async (req, res) => {
//   try {
//     const { q, limit = 20, offset = 0 } = req.query;

//     if (!q) {
//       return sendError(res, 'Search query required', 400);
//     }

//     const results = await userService.searchUsers(q, parseInt(limit), parseInt(offset));

//     logger.info('Users searched', { query: q, count: results.length });
//     return sendSuccess(res, results, 'Search results');
//   } catch (error) {
//     logger.error('Error searching users', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };