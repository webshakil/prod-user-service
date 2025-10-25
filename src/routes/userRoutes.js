import express from 'express';
import * as userController from '../controllers/userController.js';
import {
  requireUserId,
  verifyUserExists,
  hasRole,
  isAdmin,
} from '../middleware/roleAuth.js';

const router = express.Router();

// Public endpoints - no auth
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserById);

// Protected endpoints - require userId
router.post('/me/data', requireUserId, verifyUserExists, hasRole('Voter'), 
  userController.getCompleteUserData);

export default router;
