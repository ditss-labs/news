import User from '../models/User.js';

export const getBalance = async (req, res) => {
  try {
    const { jid } = req.user;
    
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      balance: {
        money: user.economy.currencies.money,
        bank: user.economy.currencies.bank,
        crystals: user.economy.currencies.crystals,
        gems: user.economy.currencies.gems,
        totalEarned: user.economy.totalEarned,
        totalSpent: user.economy.totalSpent
      }
    });
    
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const transfer = async (req, res) => {
  try {
    const { jid } = req.user;
    const { to, amount, type = 'money' } = req.body;
    
    if (!to || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid transfer data' 
      });
    }
    
    const fromUser = await User.findById(jid);
    const toJid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    const toUser = await User.findById(toJid);
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Cek saldo
    if (fromUser.economy.currencies[type] < amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient ${type} balance` 
      });
    }
    
    // Proses transfer
    fromUser.economy.currencies[type] -= amount;
    toUser.economy.currencies[type] += amount;
    
    // Catat transaksi
    const transaction = {
      type: 'transfer',
      amount,
      description: `Transfer to ${toUser.profile.name || toJid}`,
      date: new Date()
    };
    
    fromUser.economy.transactionHistory.push(transaction);
    fromUser.economy.totalSpent += amount;
    
    toUser.economy.transactionHistory.push({
      ...transaction,
      description: `Transfer from ${fromUser.profile.name || jid}`
    });
    toUser.economy.totalEarned += amount;
    
    await fromUser.save();
    await toUser.save();
    
    res.json({
      success: true,
      message: 'Transfer successful',
      newBalance: fromUser.economy.currencies[type]
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { jid } = req.user;
    const { limit = 10 } = req.query;
    
    const user = await User.findById(jid);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const transactions = user.economy.transactionHistory
      .slice(-parseInt(limit))
      .reverse();
    
    res.json({
      success: true,
      transactions
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
