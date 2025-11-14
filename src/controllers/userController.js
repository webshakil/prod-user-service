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

// ✅ FIXED: Get all users with pagination, filters, and search
export const getAllUsers = async (req, res) => {
  try {
    // ✅ userId already extracted by requireUserId middleware
    const requestingUserId = req.userId;

    const {
      page = 1,
      limit = 20,
      search = '',
      gender = '',
      country = '',
      ageMin = 0,
      ageMax = 150,
      sortBy = 'collected_at',
      sortOrder = 'DESC',
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      gender,
      country,
      ageMin: parseInt(ageMin),
      ageMax: parseInt(ageMax),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
    };

    const result = await userService.getAllUsers(filters);

    logger.info('All users retrieved', { 
      requestingUserId,
      page: filters.page, 
      totalUsers: result.total 
    });

    return sendSuccess(res, result, 'Users retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving all users', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

// ✅ FIXED: Get user demographic analytics
export const getUserAnalytics = async (req, res) => {
  try {
    // ✅ userId already extracted by requireUserId middleware
    const requestingUserId = req.userId;

    const analytics = await userService.getUserAnalytics();

    logger.info('User analytics retrieved', { requestingUserId });
    return sendSuccess(res, analytics, 'Analytics retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user analytics', { error: error.message });
    return sendError(res, error.message, 500);
  }
};
//last workable code
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
//     const { userId } = req.body;

//     if (!userId) {
//       return sendError(res, 'User ID required in request body', 400);
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

// // ✅ NEW: Get all users with pagination, filters, and search
// export const getAllUsers = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 20,
//       search = '',
//       gender = '',
//       country = '',
//       ageMin = 0,
//       ageMax = 150,
//       sortBy = 'collected_at',
//       sortOrder = 'DESC',
//     } = req.query;

//     const filters = {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       search,
//       gender,
//       country,
//       ageMin: parseInt(ageMin),
//       ageMax: parseInt(ageMax),
//       sortBy,
//       sortOrder: sortOrder.toUpperCase(),
//     };

//     const result = await userService.getAllUsers(filters);

//     logger.info('All users retrieved', { 
//       page: filters.page, 
//       totalUsers: result.total 
//     });

//     return sendSuccess(res, result, 'Users retrieved successfully');
//   } catch (error) {
//     logger.error('Error retrieving all users', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };

// // ✅ NEW: Get user demographic analytics
// export const getUserAnalytics = async (req, res) => {
//   try {
//     const analytics = await userService.getUserAnalytics();

//     logger.info('User analytics retrieved');
//     return sendSuccess(res, analytics, 'Analytics retrieved successfully');
//   } catch (error) {
//     logger.error('Error retrieving user analytics', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };
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
//     // Get userId from request body (sent from frontend)
//     const { userId } = req.body;

//     if (!userId) {
//       return sendError(res, 'User ID required in request body', 400);
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

