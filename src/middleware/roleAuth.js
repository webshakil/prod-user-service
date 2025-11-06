import { query } from '../config/database.js';
import { sendError } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

// ✅ Extract userId from x-user-data header, body, query, or params
export const requireUserId = (req, res, next) => {
  try {
    let userId = null;

    // ✅ PRIORITY 1: Extract from x-user-data header (for admin endpoints)
    const xUserData = req.headers['x-user-data'];
    if (xUserData) {
      try {
        const userData = JSON.parse(xUserData);
        userId = userData.userId;
        console.log('✅ userId extracted from x-user-data header:', userId);
      } catch (error) {
        console.error('❌ Failed to parse x-user-data header:', error);
      }
    }

    // ✅ PRIORITY 2: Extract from request body
    if (!userId && req.body?.userId) {
      userId = req.body.userId;
      console.log('✅ userId extracted from body:', userId);
    }

    // ✅ PRIORITY 3: Extract from query params
    if (!userId && req.query?.userId) {
      userId = parseInt(req.query.userId);
      console.log('✅ userId extracted from query:', userId);
    }

    // ✅ PRIORITY 4: Extract from route params
    if (!userId && req.params?.userId) {
      userId = parseInt(req.params.userId);
      console.log('✅ userId extracted from params:', userId);
    }

    console.log('🔍 Extracting userId:', {
      fromHeader: xUserData ? JSON.parse(xUserData).userId : undefined,
      fromBody: req.body?.userId,
      fromQuery: req.query?.userId,
      fromParams: req.params?.userId,
      final: userId,
    });

    if (!userId) {
      console.error('❌ No userId found in request');
      return sendError(res, 'User ID required in request body or params', 400);
    }

    // ✅ Attach userId to request object for use in controllers
    req.userId = userId;
    console.log('✅ userId extracted:', userId);

    next();
  } catch (error) {
    logger.error('Error in requireUserId middleware', { error: error.message });
    return sendError(res, 'Failed to extract user ID', 500);
  }
};

// ✅ Verify user exists in database
export const verifyUserExists = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 'User ID not found', 400);
    }

    console.log('🔍 Verifying user exists for userId:', userId);

    const result = await query(
      'SELECT user_id FROM public.users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.error('❌ User not found:', userId);
      return sendError(res, 'User not found', 404);
    }

    console.log('📊 User verification result: found');
    console.log('✅ User verified');

    next();
  } catch (error) {
    logger.error('Error verifying user', { error: error.message });
    return sendError(res, 'Failed to verify user', 500);
  }
};

// ✅ Check if user has required role
export const hasRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      console.log('🔍 Checking role:', { userId, requiredRole });

      // Get user roles from x-user-data header
      const xUserData = req.headers['x-user-data'];
      if (xUserData) {
        try {
          const userData = JSON.parse(xUserData);
          const userRoles = userData.roles || [];

          console.log('📊 User roles:', userRoles);

          if (userRoles.includes(requiredRole)) {
            console.log('✅ Role check passed');
            return next();
          } else {
            console.error('❌ Role check failed - missing role:', requiredRole);
            return sendError(res, `Insufficient permissions. Required role: ${requiredRole}`, 403);
          }
        } catch (error) {
          console.error('❌ Failed to parse x-user-data for role check:', error);
          return sendError(res, 'Failed to verify user roles', 500);
        }
      }

      // Fallback: Query database for roles
      const result = await query(
        `SELECT role_name FROM votteryy_user_roles WHERE user_id = $1`,
        [userId]
      );

      const userRoles = result.rows.map((row) => row.role_name);

      console.log('📊 User roles (from DB):', userRoles);

      if (userRoles.includes(requiredRole)) {
        console.log('✅ Role check passed');
        next();
      } else {
        console.error('❌ Role check failed - missing role:', requiredRole);
        return sendError(res, `Insufficient permissions. Required role: ${requiredRole}`, 403);
      }
    } catch (error) {
      logger.error('Error checking role', { error: error.message });
      return sendError(res, 'Failed to check role', 500);
    }
  };
};

// ✅ Check if user is Admin
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    console.log('🔍 Checking admin status for userId:', userId);

    // Get user roles from x-user-data header
    const xUserData = req.headers['x-user-data'];
    if (xUserData) {
      try {
        const userData = JSON.parse(xUserData);
        const userRoles = userData.roles || [];

        console.log('📊 User roles:', userRoles);

        if (userRoles.includes('Admin') || userRoles.includes('Manager')) {
          console.log('✅ Admin check passed');
          return next();
        } else {
          console.error('❌ Admin check failed - not an admin');
          return sendError(res, 'Admin access required', 403);
        }
      } catch (error) {
        console.error('❌ Failed to parse x-user-data for admin check:', error);
        return sendError(res, 'Failed to verify admin status', 500);
      }
    }

    // Fallback: Query database
    const result = await query(
      `SELECT role_name FROM votteryy_user_roles WHERE user_id = $1`,
      [userId]
    );

    const userRoles = result.rows.map((row) => row.role_name);

    console.log('📊 User roles (from DB):', userRoles);

    if (userRoles.includes('Admin') || userRoles.includes('Manager')) {
      console.log('✅ Admin check passed');
      next();
    } else {
      console.error('❌ Admin check failed - not an admin');
      return sendError(res, 'Admin access required', 403);
    }
  } catch (error) {
    logger.error('Error checking admin status', { error: error.message });
    return sendError(res, 'Failed to verify admin status', 500);
  }
};

export default {
  requireUserId,
  verifyUserExists,
  hasRole,
  isAdmin,
};