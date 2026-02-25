import express from 'express';
import { login, logout, me, setPassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, me);
router.post('/set-password', setPassword);

export default router;
