import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and password required' 
      });
    }
    
    // Cari user berdasarkan nomor telepon (jid)
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Cek password
    const isValid = await bcrypt.compare(password, user.profile.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        jid: user._id, 
        phone: phone.split('@')[0],
        name: user.profile.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        jid: user._id,
        phone: user._id.split('@')[0],
        name: user.profile.name,
        level: user.account.level,
        money: user.economy.currencies.money,
        avatar: user.profile.avatar
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout successful' });
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        jid: user._id,
        phone: user._id.split('@')[0],
        name: user.profile.name,
        level: user.account.level,
        exp: user.account.exp,
        nextLevelExp: user.account.nextLevelExp,
        money: user.economy.currencies.money,
        bank: user.economy.currencies.bank,
        crystals: user.economy.currencies.crystals,
        avatar: user.profile.avatar,
        registered: user.account.registered
      }
    });
    
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
