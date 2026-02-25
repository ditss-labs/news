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
    
    // ===== UPDATE WEBSITE DATA =====
    const now = new Date();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Update lastLogin
    user.logs.lastLogin = now;
    user.website.lastVisit = now;
    user.website.pageViews = (user.website.pageViews || 0) + 1;
    
    // Add to login history
    if (!user.logs.loginHistory) user.logs.loginHistory = [];
    user.logs.loginHistory.push({
      ip: ip || 'unknown',
      device: userAgent || 'unknown',
      timestamp: now
    });
    
    // Add to sessions
    if (!user.website.sessions) user.website.sessions = [];
    const sessionId = Math.random().toString(36).substring(2, 15);
    user.website.sessions.push(sessionId);
    
    // Add to dailyVisits
    if (!user.website.dailyVisits) user.website.dailyVisits = [];
    const today = new Date().toDateString();
    const alreadyVisitedToday = user.website.dailyVisits.some(
      date => new Date(date).toDateString() === today
    );
    if (!alreadyVisitedToday) {
      user.website.dailyVisits.push(now);
    }
    
    // Save to database
    await user.save();
    
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        jid: user._id,
        phone: user._id.split('@')[0],
        name: user.profile.name || 'User',
        nickname: user.profile.nickname || '',
        bio: user.profile.bio || '',
        avatar: user.profile.avatar || '',
        level: user.account.level || 1,
        exp: user.account.exp || 0,
        nextLevelExp: user.account.nextLevelExp || 100,
        title: user.account.title || 'Member',
        money: user.economy?.currencies?.money || 0,
        bank: user.economy?.currencies?.bank || 0,
        crystals: user.economy?.currencies?.crystals || 0,
        registered: user.account.registered || false,
        registeredDate: user.account.registrationDate,
        lastActive: user.stats.lastActive,
        lastLogin: now
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

export const logout = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.jid);
      if (user) {
        user.logs.lastLogout = new Date();
        await user.save();
      }
    }
  } catch (error) {
    console.error('Logout update error:', error);
  }
  
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout successful' });
};

export const setPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    const user = await User.findById(jid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const hashed = await bcrypt.hash(password, 10);
    user.profile.password = hashed;
    user.account.registered = true;
    await user.save();
    res.json({ success: true, message: 'Password berhasil diset' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
        nickname: user.profile.nickname || '',
        bio: user.profile.bio || '',
        avatar: user.profile.avatar || '',
        level: user.account.level || 1,
        exp: user.account.exp || 0,
        nextLevelExp: user.account.nextLevelExp || 100,
        title: user.account.title || 'Member',
        money: user.economy?.currencies?.money || 0,
        bank: user.economy?.currencies?.bank || 0,
        crystals: user.economy?.currencies?.crystals || 0,
        registered: user.account.registered || false,
        registeredDate: user.account.registrationDate,
        lastActive: user.stats.lastActive,
        lastLogin: user.logs.lastLogin
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
