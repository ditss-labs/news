import express from 'express';
import { requestOTP, verifyOTP, checkOTPStatus } from '../controllers/otp.js';

const router = express.Router();

// Request OTP (kirim ke bot)
router.post('/send', requestOTP);

// Verifikasi OTP (input user)
router.post('/verify', verifyOTP);

// Cek status OTP (opsional)
router.get('/status/:phone', checkOTPStatus);

export default router;
