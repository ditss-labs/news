import User from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'level', limit = 10 } = req.query;
    
    let sortField = {};
    
    switch(type) {
      case 'level':
        sortField = { 'account.level': -1, 'account.exp': -1 };
        break;
      case 'money':
        sortField = { 'economy.currencies.money': -1 };
        break;
      case 'bank':
        sortField = { 'economy.currencies.bank': -1 };
        break;
      case 'crystals':
        sortField = { 'economy.currencies.crystals': -1 };
        break;
      default:
        sortField = { 'account.level': -1 };
    }
    
    const users = await User.find({ 'account.registered': true })
      .sort(sortField)
      .limit(parseInt(limit))
      .select('_id profile.name account.level account.exp economy.currencies profile.avatar');
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      jid: user._id,
      phone: user._id.split('@')[0],
      name: user.profile.name || 'Anonymous',
      level: user.account.level,
      exp: user.account.exp,
      money: user.economy.currencies.money,
      bank: user.economy.currencies.bank,
      crystals: user.economy.currencies.crystals,
      avatar: user.profile.avatar
    }));
    
    res.json({
      success: true,
      type,
      leaderboard
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getRank = async (req, res) => {
  try {
    const { jid } = req.user;
    
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Hitung rank berdasarkan level
    const higherLevelUsers = await User.countDocuments({
      'account.level': { $gt: user.account.level }
    });
    
    const sameLevelHigherExp = await User.countDocuments({
      'account.level': user.account.level,
      'account.exp': { $gt: user.account.exp }
    });
    
    const rank = higherLevelUsers + sameLevelHigherExp + 1;
    
    res.json({
      success: true,
      rank,
      total: await User.countDocuments({ 'account.registered': true })
    });
    
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
