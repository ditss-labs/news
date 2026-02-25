import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:phone', getProfile);
router.put('/update', verifyToken, updateProfile); // Ganti dari POST ke PUT

export default router;
