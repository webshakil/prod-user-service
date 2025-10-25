import { sendSuccess, sendError } from '../utils/responseFormatter.js';
import * as userService from '../services/userService.js';
import { validateUserUpdate, validatePreferences } from '../utils/validators.js';
import logger from '../utils/logger.js';

export const getProfile = async (req, res) => {
  try {
    // Get userId from request body (sent from frontend)
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 'User ID required in request body', 400);
    }

    const profile = await userService.getUserProfile(userId);

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
    const { userId, ...profileData } = req.body;

    if (!userId) {
      return sendError(res, 'User ID required in request body', 400);
    }

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
    // Get userId from request body (sent from frontend)
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, 'User ID required in request body', 400);
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
    const { userId, ...preferences } = req.body;

    if (!userId) {
      return sendError(res, 'User ID required in request body', 400);
    }

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
// import { sendSuccess, sendError } from '../utils/responseFormatter.js';
// import * as userService from '../services/userService.js';
// import { validateUserUpdate, validatePreferences } from '../utils/validators.js';
// import logger from '../utils/logger.js';

// export const getProfile = async (req, res) => {
//   try {
//     const userId = req.userId;

//     if (!userId) {
//       return sendError(res, 'Unauthorized', 401);
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
//     const userId = req.userId;
//     const { error, value } = validateUserUpdate(req.body);

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
//     const userId = req.userId;

//     if (!userId) {
//       return sendError(res, 'Unauthorized', 401);
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
//     const userId = req.userId;
//     const { error, value } = validatePreferences(req.body);

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