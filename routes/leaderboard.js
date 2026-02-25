import express from 'express';
import { getLeaderboard, getRank } from '../controllers/leaderboardController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/rank', verifyToken, getRank);

export default router;
