import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const { phone } = req.params;
    
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      profile: {
        name: user.profile.name,
        nickname: user.profile.nickname,
        bio: user.profile.bio,
        avatar: user.profile.avatar,
        level: user.account.level,
        title: user.account.title,
        registered: user.account.registered,
        registrationDate: user.account.registrationDate
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { jid } = req.user;
    const { nickname, bio, avatar } = req.body;
    
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update hanya field yang dikirim
    if (nickname !== undefined) user.profile.nickname = nickname;
    if (bio !== undefined) user.profile.bio = bio;
    if (avatar !== undefined) user.profile.avatar = avatar;
    
    // Update timestamp
    user.timestamps.updatedAt = Date.now();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        nickname: user.profile.nickname,
        bio: user.profile.bio,
        avatar: user.profile.avatar
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
