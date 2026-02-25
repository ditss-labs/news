import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const { phone } = req.params;
    const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    const user = await User.findById(jid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { jid } = req.user;
    const updates = req.body;
    const user = await User.findById(jid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (updates.name !== undefined) user.profile.name = updates.name;
    if (updates.nickname !== undefined) user.profile.nickname = updates.nickname;
    if (updates.bio !== undefined) user.profile.bio = updates.bio;
    if (updates.avatar !== undefined) user.profile.avatar = updates.avatar;
    if (updates.gender !== undefined) user.profile.gender = updates.gender;
    if (updates.age !== undefined) user.profile.age = updates.age;
    if (updates.country !== undefined) user.profile.location.country = updates.country;
    if (updates.city !== undefined) user.profile.location.city = updates.city;
    if (updates.email !== undefined) user.profile.email = updates.email;
    if (updates.darkMode !== undefined) user.settings.theme = updates.darkMode ? 'dark' : 'light';
    if (updates.emailNotifications !== undefined) user.website.preferences.emailNotifications = updates.emailNotifications;

    await user.save();
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
