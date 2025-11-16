import logger from "../utils/logger.js";
import { sendError, sendSuccess } from "../utils/responseFormatter.js";
import * as userService from '../services/userService.js';  // ✅ ADD THIS LINE
import { validateUserUpdate, validatePreferences } from '../utils/validators.js';

export const getProfile = async (req, res) => {
  try {
    // ✅ Accept userId from multiple sources
    const userId = req.body.userId || 
                   req.params.userId || 
                   req.query.userId || 
                   req.user?.userId;

    if (!userId) {
      return sendError(res, 'User ID required', 400);
    }

    const profile = await userService.getUserProfile(userId);  // ✅ NOW THIS WILL WORK

    if (!profile) {
      return sendSuccess(res, {}, 'Profile not found');
    }

    logger.info('Profile retrieved', { userId });
    return sendSuccess(res, profile, 'Profile retrieved');
  } catch (error) {
    logger.error('Error retrieving profile', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.body.userId || 
                   req.params.userId || 
                   req.query.userId || 
                   req.user?.userId;

    if (!userId) {
      return sendError(res, 'User ID required', 400);
    }

    const { userId: _, ...profileData } = req.body;

    const { error, value } = validateUserUpdate(profileData);

    if (error) {
      return sendError(res, error.details[0].message, 400);
    }

    const updated = await userService.updateUserProfile(userId, value);

    logger.info('Profile updated', { userId });
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    logger.error('Error updating profile', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

export const getPreferences = async (req, res) => {
  try {
    const userId = req.body.userId || 
                   req.params.userId || 
                   req.query.userId || 
                   req.user?.userId;

    if (!userId) {
      return sendError(res, 'User ID required', 400);
    }

    const preferences = await userService.getUserPreferences(userId);

    if (!preferences) {
      return sendSuccess(res, {}, 'Preferences not found');
    }

    logger.info('Preferences retrieved', { userId });
    return sendSuccess(res, preferences, 'Preferences retrieved');
  } catch (error) {
    logger.error('Error retrieving preferences', { error: error.message });
    return sendError(res, error.message, 500);
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const userId = req.body.userId || 
                   req.params.userId || 
                   req.query.userId || 
                   req.user?.userId;

    if (!userId) {
      return sendError(res, 'User ID required', 400);
    }

    const { userId: _, ...preferences } = req.body;

    const { error, value } = validatePreferences(preferences);

    if (error) {
      return sendError(res, error.details[0].message, 400);
    }

    const updated = await userService.updateUserPreferences(userId, value);

    logger.info('Preferences updated', { userId });
    return sendSuccess(res, updated, 'Preferences updated successfully');
  } catch (error) {
    logger.error('Error updating preferences', { error: error.message });
    return sendError(res, error.message, 500);
  }
};
// import logger from "../utils/logger.js";
// import { sendError } from "../utils/responseFormatter.js";

// export const getProfile = async (req, res) => {
//   try {
//     // ✅ Accept userId from multiple sources
//     const userId = req.body.userId || 
//                    req.params.userId || 
//                    req.query.userId || 
//                    req.user?.userId;  // From auth middleware

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const profile = await userService.getUserProfile(userId);

//     if (!profile) {
//       return sendSuccess(res, {}, 'Profile not found');
//     }

//     logger.info('Profile retrieved', { userId });
//     return sendSuccess(res, profile, 'Profile retrieved');
//   } catch (error) {
//     logger.error('Error retrieving profile', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.body.userId || 
//                    req.params.userId || 
//                    req.query.userId || 
//                    req.user?.userId;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const { userId: _, ...profileData } = req.body; // Remove userId from profileData

//     const { error, value } = validateUserUpdate(profileData);

//     if (error) {
//       return sendError(res, error.details[0].message, 400);
//     }

//     const updated = await userService.updateUserProfile(userId, value);

//     logger.info('Profile updated', { userId });
//     return sendSuccess(res, updated, 'Profile updated successfully');
//   } catch (error) {
//     logger.error('Error updating profile', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };

// export const getPreferences = async (req, res) => {
//   try {
//     const userId = req.body.userId || 
//                    req.params.userId || 
//                    req.query.userId || 
//                    req.user?.userId;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const preferences = await userService.getUserPreferences(userId);

//     if (!preferences) {
//       return sendSuccess(res, {}, 'Preferences not found');
//     }

//     logger.info('Preferences retrieved', { userId });
//     return sendSuccess(res, preferences, 'Preferences retrieved');
//   } catch (error) {
//     logger.error('Error retrieving preferences', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };

// export const updatePreferences = async (req, res) => {
//   try {
//     const userId = req.body.userId || 
//                    req.params.userId || 
//                    req.query.userId || 
//                    req.user?.userId;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const { userId: _, ...preferences } = req.body; // Remove userId from preferences

//     const { error, value } = validatePreferences(preferences);

//     if (error) {
//       return sendError(res, error.details[0].message, 400);
//     }

//     const updated = await userService.updateUserPreferences(userId, value);

//     logger.info('Preferences updated', { userId });
//     return sendSuccess(res, updated, 'Preferences updated successfully');
//   } catch (error) {
//     logger.error('Error updating preferences', { error: error.message });
//     return sendError(res, error.message, 500);
//   }
// };