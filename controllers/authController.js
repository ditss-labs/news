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
    
    // Format JID
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please register via WhatsApp first.' 
      });
    }
    
    // Check if user has password
    if (!user.profile.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'No password set. Please register via WhatsApp first.' 
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.profile.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }
    
    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in .env file');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      token, // Send token for localStorage
      user: {
        jid: user._id,
        phone: user._id.split('@')[0],
        name: user.profile.name || 'User',
        level: user.account.level || 1,
        exp: user.account.exp || 0,
        nextLevelExp: user.account.nextLevelExp || 100,
        money: user.economy?.currencies?.money || 0,
        bank: user.economy?.currencies?.bank || 0,
        crystals: user.economy?.currencies?.crystals || 0,
        avatar: user.profile.avatar || '',
        registered: user.account.registered || false
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + error.message 
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
        name: user.profile.name || 'User',
        level: user.account.level || 1,
        exp: user.account.exp || 0,
        nextLevelExp: user.account.nextLevelExp || 100,
        money: user.economy?.currencies?.money || 0,
        bank: user.economy?.currencies?.bank || 0,
        crystals: user.economy?.currencies?.crystals || 0,
        avatar: user.profile.avatar || '',
        registered: user.account.registered || false
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
