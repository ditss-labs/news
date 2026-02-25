import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Manual Routes Imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import leaderboardRoutes from './routes/leaderboard.js';
import economyRoutes from './routes/economy.js';
import otpRoutes from './routes/otp.js';
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'asuma_bot'
    });
    console.log(chalk.green('✅ MongoDB connected'));
    
    const userCount = await User.countDocuments();
    console.log(chalk.magenta(`📊 Users: ${userCount}`));
    
    return true;
  } catch (err) {
    console.error(chalk.red('❌ MongoDB connection error:'), err);
    return false;
  }
}
app.use('/api/otp', otpRoutes);
app.get('/api/settings', (req, res) => {
  res.json({
    status: 'success',
    data: {
      maintenance: false,
      version: '1.0.0',
      features: ['login', 'profile', 'leaderboard', 'economy']
    }
  });
});
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const registeredCount = await User.countDocuments({ 'account.registered': true });
    
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
      groups: 0,
      premium: 0,
      sewa: 0,
      totalCommands: 0,
      todayCommands: 0,
      games: 0,
      economy: moneyStats[0] || { totalMoney: 0, totalBank: 0, totalCrystals: 0 },
      lastUpdate: new Date().toISOString()
    };
    
    res.json({ status: 'success', data: stats });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Debug user structure
app.get('/api/debug/user-structure/:jid?', async (req, res) => {
  try {
    const { jid } = req.params;
    
    if (jid) {
      const jidFormatted = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
      const user = await User.findById(jidFormatted);
      
      if (user) {
        const userObj = user.toObject();
        if (userObj.profile?.password) userObj.profile.password = '[HIDDEN]';
        
        res.json({
          status: 'success',
          data: { exists: true, structure: Object.keys(userObj), sample: userObj }
        });
      } else {
        res.json({ status: 'success', data: { exists: false } });
      }
    } else {
      const schemaPaths = Object.keys(User.schema.paths);
      res.json({ status: 'success', data: { schemaStructure: schemaPaths } });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
app.post('/api/save', (req, res) => {
  res.json({ status: 'success', message: 'MongoDB auto-saves' });
});
app.post('/api/refresh', (req, res) => {
  res.json({ status: 'success', message: 'MongoDB always fresh' });
});
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/economy', economyRoutes);
// ============================================
// SERVE HTML PAGES 
// ============================================
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
console.log(chalk.blue('\n📁 Loading additional routes...'));
async function loadRoutesFromFolder(folderPath, baseRoute = '') {
  const fullPath = path.join(__dirname, 'routes', folderPath);
  
  if (!fs.existsSync(fullPath)) return;
  
  const items = fs.readdirSync(fullPath);
  
  for (const item of items) {
    const itemPath = path.join(fullPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      await loadRoutesFromFolder(path.join(folderPath, item), `${baseRoute}/${item}`);
    } else if (item.endsWith('.js')) {
      try {
        const routeModule = await import(`./routes/${folderPath}/${item}`);
        
        if (typeof routeModule.default === 'function') {
          routeModule.default(app);
          console.log(chalk.green(`   ✅ ${folderPath}/${item}`));
        }
      } catch (error) {
        console.log(chalk.red(`   ❌ ${folderPath}/${item}: ${error.message}`));
      }
    }
  }
}
await loadRoutesFromFolder('user');
console.log(chalk.blue('📁 Additional routes loaded!\n'));
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(chalk.red('Server error:'), err);
  res.status(500).json({ status: 'error', message: err.message });
});
async function startServer() {
  const dbConnected = await connectDB();
  
  app.listen(PORT, () => {
    console.log(chalk.green(`\n🚀 Server running on port ${PORT}`));
    console.log(chalk.cyan(`📝 API: http://localhost:${PORT}`));
    console.log(chalk.yellow(`💾 Database: ${dbConnected ? 'MongoDB' : 'Failed'}`));
  });
}

startServer().catch(console.error);
