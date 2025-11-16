import express from 'express';
import * as profileController from '../controllers/profileController.js';
import {
  requireUserId,
  verifyUserExists,
  hasRole,
  isAdmin,
} from '../middleware/roleAuth.js';

const router = express.Router();

// All profile endpoints require userId and user to exist
router.use(requireUserId);
router.use(verifyUserExists);

// ✅ Get profile - NO role check (any authenticated user can view their own profile)
router.post('/me', profileController.getProfile);

// ✅ Update profile - NO role check (any authenticated user can update their own profile)
router.post('/me/update', profileController.updateProfile);

// ✅ Get preferences - NO role check (any authenticated user can view their own preferences)
router.post('/me/preferences', profileController.getPreferences);

// ✅ Update preferences - NO role check (any authenticated user can update their own preferences)
router.post('/me/preferences/update', profileController.updatePreferences);

// ✅ Admin: Get any user profile - KEEP role check (only admins can view other users' profiles)
router.get('/admin/:userId', isAdmin, profileController.getProfile);

// ✅ Admin: Update any user profile - KEEP role check (only admins can update other users' profiles)
router.put('/admin/:userId', isAdmin, profileController.updateProfile);

export default router;
//last workable code
// import express from 'express';
// import * as profileController from '../controllers/profileController.js';
// //import * as profileController from '../controllers/profileController.js';
// import {
//   requireUserId,
//   verifyUserExists,
//   hasRole,
//   isAdmin,
// } from '../middleware/roleAuth.js';

// const router = express.Router();

// // All profile endpoints require userId and user to exist
// router.use(requireUserId);
// router.use(verifyUserExists);

// // Get profile - Voter or higher
// router.post('/me', hasRole('Voter'), profileController.getProfile);

// // Update profile - Only self or Admin
// router.post('/me/update', hasRole('Voter'), profileController.updateProfile);

// // Get preferences - Voter or higher
// router.post('/me/preferences', hasRole('Voter'), profileController.getPreferences);

// // Update preferences - Only self or Admin
// router.post('/me/preferences/update', hasRole('Voter'), profileController.updatePreferences);

// // Admin: Get any user profile
// router.get('/admin/:userId', isAdmin, profileController.getProfile);

// // Admin: Update any user profile
// router.put('/admin/:userId', isAdmin, profileController.updateProfile);

// export default router;
