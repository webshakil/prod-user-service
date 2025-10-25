import express from 'express';
import * as profileController from '../controllers/profileController.js';
//import * as profileController from '../controllers/profileController.js';
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

// Get profile - Voter or higher
router.post('/me', hasRole('Voter'), profileController.getProfile);

// Update profile - Only self or Admin
router.post('/me/update', hasRole('Voter'), profileController.updateProfile);

// Get preferences - Voter or higher
router.post('/me/preferences', hasRole('Voter'), profileController.getPreferences);

// Update preferences - Only self or Admin
router.post('/me/preferences/update', hasRole('Voter'), profileController.updatePreferences);

// Admin: Get any user profile
router.get('/admin/:userId', isAdmin, profileController.getProfile);

// Admin: Update any user profile
router.put('/admin/:userId', isAdmin, profileController.updateProfile);

export default router;
// import express from 'express';
// import * as profileController from '../controllers/profileController.js';

// const router = express.Router();

// // All endpoints require userId in request body
// router.post('/me', profileController.getProfile);
// router.post('/me/update', profileController.updateProfile);
// router.post('/me/preferences', profileController.getPreferences);
// router.post('/me/preferences/update', profileController.updatePreferences);

// export default router;
// import express from 'express';
// import * as profileController from '../controllers/profileController.js';
// import { verifyToken } from '../middleware/auth.js';

// const router = express.Router();

// router.get('/me', verifyToken, profileController.getProfile);
// router.put('/me', verifyToken, profileController.updateProfile);
// router.get('/me/preferences', verifyToken, profileController.getPreferences);
// router.put('/me/preferences', verifyToken, profileController.updatePreferences);

// export default router;