import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk'; // Install: npm install chalk

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import leaderboardRoutes from './routes/leaderboard.js';
import economyRoutes from './routes/economy.js';

// Models
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));

// ============================================
// DATABASE CONNECTION (MongoDB only)
// ============================================
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'asuma_bot'
    });
    console.log(chalk.green('✅ MongoDB connected'));
    
    // Hitung total users
    const userCount = await User.countDocuments();
    console.log(chalk.magenta(`📊 Users: ${userCount}`));
    
    return true;
  } catch (err) {
    console.error(chalk.red('❌ MongoDB connection error:'), err);
    return false;
  }
}

// ============================================
// API ROUTES (MongoDB version - NO global.db)
// ============================================

// Settings (example - adjust as needed)
app.get('/api/settings', (req, res) => {
  try {
    // You can store settings in a separate collection if needed
    res.json({
      status: 'success',
      data: {
        maintenance: false,
        version: '1.0.0',
        features: ['login', 'profile', 'leaderboard', 'economy']
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Stats (from MongoDB)
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const registeredCount = await User.countDocuments({ 'account.registered': true });
    
    // Get total money in economy
    const moneyStats = await User.aggregate([
      { $group: {
        _id: null,
        totalMoney: { $sum: '$economy.currencies.money' },
        totalBank: { $sum: '$economy.currencies.bank' },
        totalCrystals: { $sum: '$economy.currencies.crystals' }
      }}
    ]);
    
    const stats = {
      users: userCount,
      registered: registeredCount,
      groups: 0, // You can add groups collection if needed
      premium: 0,
      sewa: 0,
      totalCommands: 0,
      todayCommands: 0,
      games: 0,
      economy: moneyStats[0] || { totalMoney: 0, totalBank: 0, totalCrystals: 0 },
      lastUpdate: new Date().toISOString()
    };
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Debug: lihat struktur user (MongoDB version)
app.get('/api/debug/user-structure/:jid?', async (req, res) => {
  try {
    const { jid } = req.params;
    
    if (jid) {
      const jidFormatted = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
      const user = await User.findById(jidFormatted);
      
      if (user) {
        // Convert to object and remove sensitive data
        const userObj = user.toObject();
        if (userObj.profile?.password) {
          userObj.profile.password = '[HIDDEN]';
        }
        
        res.json({
          status: 'success',
          data: {
            exists: true,
            structure: Object.keys(userObj),
            sample: userObj
          }
        });
      } else {
        res.json({
          status: 'success',
          data: {
            exists: false,
            message: 'User not found'
          }
        });
      }
    } else {
      // Get schema structure from model
      const schemaPaths = Object.keys(User.schema.paths);
      
      res.json({
        status: 'success',
        data: {
          schemaStructure: schemaPaths,
          note: 'Send JID to see specific user data'
        }
      });
    }
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Manual save (no-op in MongoDB - auto-save)
app.post('/api/save', (req, res) => {
  res.json({
    status: 'success',
    message: 'MongoDB auto-saves automatically',
    timestamp: new Date().toISOString()
  });
});

// Refresh (no-op in MongoDB)
app.post('/api/refresh', (req, res) => {
  res.json({
    status: 'success',
    message: 'MongoDB always fresh',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// MAIN ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/economy', economyRoutes);

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(chalk.red('Server error:'), err);
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  // Connect to MongoDB
  const dbConnected = await connectDB();
  
  app.listen(PORT, () => {
    console.log(chalk.green(`\n🚀 Server running on port ${PORT}`));
    console.log(chalk.cyan(`📝 API: http://localhost:${PORT}`));
    console.log(chalk.yellow(`💾 Database: ${dbConnected ? 'MongoDB' : 'Failed'}`));
  });
}

startServer().catch(console.error);
