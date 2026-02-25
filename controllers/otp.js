import Otp from '../models/Otp.js';
import User from '../models/User.js';

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP (dari halaman login/register)
export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nomor telepon diperlukan' 
      });
    }

    // Format JID
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    
    // Generate OTP
    const otpCode = generateOTP();
    
    // Simpan ke database dengan status pending
    await Otp.create({
      phone,
      jid,
      otp: otpCode,
      status: 'pending'
    });

    console.log(`📝 OTP ${otpCode} untuk ${phone} disimpan (pending)`);

    res.json({ 
      success: true, 
      message: 'OTP akan segera dikirim via WhatsApp. Cek bot Anda.' 
    });
    
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses OTP' 
    });
  }
};

// Verifikasi OTP (saat user input kode)
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nomor dan OTP diperlukan' 
      });
    }

    // Cari OTP terbaru untuk nomor ini
    const otpRecord = await Otp.findOne({
      phone,
      status: { $in: ['pending', 'sent'] } // Bisa pending (belum dikirim) atau sent (sudah dikirim)
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP tidak ditemukan. Minta OTP baru.' 
      });
    }

    // Cek apakah OTP cocok
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kode OTP salah' 
      });
    }

    // Update status jadi verified
    otpRecord.status = 'verified';
    await otpRecord.save();

    // Cari atau buat user
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    let user = await User.findById(jid);

    if (!user) {
      // Auto register user baru
      user = new User({
        _id: jid,
        jid: jid,
        profile: {
          name: `User_${phone.slice(-4)}`,
          isPhoneVerified: true
        }
      });
      await user.save();
      console.log(`✅ User baru dibuat: ${phone}`);
    }

    // Update last login
    user.logs.lastLogin = new Date();
    user.website.lastVisit = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Verifikasi berhasil',
      isNewUser: !user.account.registered,
      user: {
        jid: user._id,
        phone: phone,
        name: user.profile.name,
        nickname: user.profile.nickname
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Cek status OTP (opsional, untuk polling)
export const checkOTPStatus = async (req, res) => {
  try {
    const { phone } = req.params;
    
    const otpRecord = await Otp.findOne({
      phone,
      status: 'verified'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      verified: !!otpRecord
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
