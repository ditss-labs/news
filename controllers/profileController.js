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
        age: user.profile.age,
        gender: user.profile.gender,
        location: user.profile.location,
        avatar: user.profile.avatar,
        level: user.account.level,
        exp: user.account.exp,
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
    const updates = req.body;
    
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update profile fields
    if (updates.name) user.profile.name = updates.name;
    if (updates.nickname) user.profile.nickname = updates.nickname;
    if (updates.bio) user.profile.bio = updates.bio;
    if (updates.age) user.profile.age = updates.age;
    if (updates.gender) user.profile.gender = updates.gender;
    if (updates.avatar) user.profile.avatar = updates.avatar;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
