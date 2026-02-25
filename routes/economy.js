import express from 'express';
import { getBalance, transfer, getTransactions } from '../controllers/economyController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/balance', verifyToken, getBalance);
router.post('/transfer', verifyToken, transfer);
router.get('/transactions', verifyToken, getTransactions);

export default router;
