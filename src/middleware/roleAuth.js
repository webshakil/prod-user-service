import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { sendError } from '../utils/responseFormatter.js';

// Get user roles from database
export const getUserRoles = async (userId) => {
  try {
    if (!userId) {
      return ['Voter'];
    }

    const result = await query(
      `SELECT role_name FROM votteryy_user_roles 
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return ['Voter']; // Default role if no roles assigned
    }

    return result.rows.map(row => row.role_name);
  } catch (error) {
    logger.error('Error fetching user roles', { error: error.message, userId });
    return ['Voter']; // Default role on error
  }
};

// Extract userId from request body/query/params
export const requireUserId = (req, res, next) => {
  try {
    // Try to get userId from body first, then query, then params
    const userId = req.body?.userId || req.query?.userId || req.params?.userId;

    console.log('🔍 Extracting userId:', { 
      fromBody: req.body?.userId,
      fromQuery: req.query?.userId,
      fromParams: req.params?.userId,
      final: userId 
    });

    if (!userId) {
      return sendError(res, 'User ID required in request body or params', 400);
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return sendError(res, 'Invalid User ID format', 400);
    }

    req.userId = parsedUserId;
    console.log('✅ userId extracted:', req.userId);
    next();
  } catch (error) {
    logger.error('Error extracting userId', { error: error.message });
    return sendError(res, 'Error processing User ID', 400);
  }
};

// Verify user exists in database
export const verifyUserExists = async (req, res, next) => {
  try {
    const userId = req.userId;

    console.log('🔍 Verifying user exists for userId:', userId);

    if (!userId) {
      return sendError(res, 'User ID not found', 400);
    }

    // Check if user exists in public.users table
    const result = await query(
      'SELECT user_id FROM public.users WHERE user_id = $1',
      [userId]
    );

    console.log('📊 User verification result:', result.rows.length > 0 ? 'found' : 'not found');

    if (result.rows.length === 0) {
      logger.warn('User not found', { userId });
      return sendError(res, 'User not found', 404);
    }

    console.log('✅ User verified');
    next();
  } catch (error) {
    logger.error('Error verifying user', { error: error.message, userId: req.userId });
    console.error('❌ Verify user error:', error.message);
    return sendError(res, 'Error verifying user: ' + error.message, 500);
  }
};

// Check single role
export const hasRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      console.log('🔍 Checking role:', { userId, requiredRole });

      if (!userId) {
        return sendError(res, 'User ID required', 400);
      }

      const roles = await getUserRoles(userId);
      console.log('📊 User roles:', roles);

      if (!roles.includes(requiredRole)) {
        logger.warn('Access denied - insufficient role', {
          userId,
          requiredRole,
          userRoles: roles,
        });
        console.log('❌ Access denied - role mismatch');
        return sendError(res, `Access denied. Required role: ${requiredRole}`, 403);
      }

      req.roles = roles;
      console.log('✅ Role check passed');
      next();
    } catch (error) {
      logger.error('Error checking roles', { error: error.message });
      console.error('❌ Role check error:', error.message);
      return sendError(res, 'Error checking permissions: ' + error.message, 500);
    }
  };
};

// Check multiple roles (OR logic)
export const hasAnyRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return sendError(res, 'User ID required', 400);
      }

      const roles = await getUserRoles(userId);
      const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

      if (!hasRequiredRole) {
        logger.warn('Access denied - insufficient roles', {
          userId,
          requiredRoles,
          userRoles: roles,
        });
        return sendError(
          res,
          `Access denied. Required one of: ${requiredRoles.join(', ')}`,
          403
        );
      }

      req.roles = roles;
      next();
    } catch (error) {
      logger.error('Error checking roles', { error: error.message });
      return sendError(res, 'Error checking permissions', 500);
    }
  };
};

// Check all roles (AND logic)
export const hasAllRoles = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return sendError(res, 'User ID required', 400);
      }

      const roles = await getUserRoles(userId);
      const hasAllRequiredRoles = requiredRoles.every(role => 
        roles.includes(role)
      );

      if (!hasAllRequiredRoles) {
        logger.warn('Access denied - missing required roles', {
          userId,
          requiredRoles,
          userRoles: roles,
        });
        return sendError(
          res,
          `Access denied. Required all of: ${requiredRoles.join(', ')}`,
          403
        );
      }

      req.roles = roles;
      next();
    } catch (error) {
      logger.error('Error checking roles', { error: error.message });
      return sendError(res, 'Error checking permissions', 500);
    }
  };
};

// Check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 'User ID required', 400);
    }

    const roles = await getUserRoles(userId);

    if (!roles.includes('Admin')) {
      logger.warn('Access denied - admin only', { userId, roles });
      return sendError(res, 'Admin access required', 403);
    }

    req.roles = roles;
    next();
  } catch (error) {
    logger.error('Error checking admin status', { error: error.message });
    return sendError(res, 'Error checking permissions', 500);
  }
};

export default {
  requireUserId,
  verifyUserExists,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isAdmin,
  getUserRoles,
};
// import { query } from '../config/database.js';
// import logger from '../utils/logger.js';
// import { sendError } from '../utils/responseFormatter.js';

// // ✅ Get user roles from database
// export const getUserRoles = async (userId) => {
//   try {
//     const result = await query(
//       `SELECT role_name FROM votteryy_user_roles 
//        WHERE user_id = $1 AND is_active = true`,
//       [userId]
//     );
//     return result.rows.map(row => row.role_name) || ['Voter'];
//   } catch (error) {
//     logger.error('Error fetching user roles', { error: error.message, userId });
//     return ['Voter']; // Default role
//   }
// };

// // ✅ Check if userId exists in request body
// export const requireUserId = (req, res, next) => {
//   try {
//     const userId = req.body?.userId || req.query?.userId || req.params?.userId;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     req.userId = parseInt(userId);
//     logger.debug('User ID extracted', { userId: req.userId });
//     next();
//   } catch (error) {
//     logger.error('Error extracting userId', { error: error.message });
//     return sendError(res, 'Invalid User ID', 400);
//   }
// };

// // ✅ Verify user exists
// export const verifyUserExists = async (req, res, next) => {
//   try {
//     const userId = req.userId;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const result = await query(
//       'SELECT user_id FROM public.users WHERE user_id = $1',
//       [userId]
//     );

//     if (result.rows.length === 0) {
//       return sendError(res, 'User not found', 404);
//     }

//     logger.debug('User verified', { userId });
//     next();
//   } catch (error) {
//     logger.error('Error verifying user', { error: error.message });
//     return sendError(res, 'Error verifying user', 500);
//   }
// };

// // ✅ Check single role
// export const hasRole = (requiredRole) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.userId;

//       if (!userId) {
//         return sendError(res, 'User ID required', 400);
//       }

//       const roles = await getUserRoles(userId);
//       logger.debug('User roles checked', { userId, roles });

//       if (!roles.includes(requiredRole)) {
//         logger.warn('Access denied - insufficient role', {
//           userId,
//           requiredRole,
//           userRoles: roles,
//         });
//         return sendError(res, `Access denied. Required role: ${requiredRole}`, 403);
//       }

//       req.roles = roles;
//       next();
//     } catch (error) {
//       logger.error('Error checking roles', { error: error.message });
//       return sendError(res, 'Error checking permissions', 500);
//     }
//   };
// };

// // ✅ Check multiple roles (OR logic)
// export const hasAnyRole = (requiredRoles) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.userId;

//       if (!userId) {
//         return sendError(res, 'User ID required', 400);
//       }

//       const roles = await getUserRoles(userId);
//       logger.debug('User roles checked', { userId, roles });

//       const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

//       if (!hasRequiredRole) {
//         logger.warn('Access denied - insufficient roles', {
//           userId,
//           requiredRoles,
//           userRoles: roles,
//         });
//         return sendError(
//           res,
//           `Access denied. Required one of: ${requiredRoles.join(', ')}`,
//           403
//         );
//       }

//       req.roles = roles;
//       next();
//     } catch (error) {
//       logger.error('Error checking roles', { error: error.message });
//       return sendError(res, 'Error checking permissions', 500);
//     }
//   };
// };

// // ✅ Check all roles (AND logic)
// export const hasAllRoles = (requiredRoles) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.userId;

//       if (!userId) {
//         return sendError(res, 'User ID required', 400);
//       }

//       const roles = await getUserRoles(userId);
//       logger.debug('User roles checked', { userId, roles });

//       const hasAllRequiredRoles = requiredRoles.every(role => 
//         roles.includes(role)
//       );

//       if (!hasAllRequiredRoles) {
//         logger.warn('Access denied - missing required roles', {
//           userId,
//           requiredRoles,
//           userRoles: roles,
//         });
//         return sendError(
//           res,
//           `Access denied. Required all of: ${requiredRoles.join(', ')}`,
//           403
//         );
//       }

//       req.roles = roles;
//       next();
//     } catch (error) {
//       logger.error('Error checking roles', { error: error.message });
//       return sendError(res, 'Error checking permissions', 500);
//     }
//   };
// };

// // ✅ Check if user is admin
// export const isAdmin = async (req, res, next) => {
//   try {
//     const userId = req.userId;

//     if (!userId) {
//       return sendError(res, 'User ID required', 400);
//     }

//     const roles = await getUserRoles(userId);

//     if (!roles.includes('Admin')) {
//       logger.warn('Access denied - admin only', { userId, roles });
//       return sendError(res, 'Admin access required', 403);
//     }

//     req.roles = roles;
//     next();
//   } catch (error) {
//     logger.error('Error checking admin status', { error: error.message });
//     return sendError(res, 'Error checking permissions', 500);
//   }
// };

// export default {
//   requireUserId,
//   verifyUserExists,
//   hasRole,
//   hasAnyRole,
//   hasAllRoles,
//   isAdmin,
//   getUserRoles,
// };