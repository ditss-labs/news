import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import leaderboardRoutes from './routes/leaderboard.js';
import economyRoutes from './routes/economy.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'asuma_bot'
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/economy', economyRoutes);

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Settings
app.get('/api/settings', (req, res) => {
    try {
        res.json({
            status: 'success',
            data: global.db.settings || {}
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update settings
app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        
        if (!global.db.settings) {
            global.db.settings = {};
        }
        
        Object.assign(global.db.settings, settings);
        await database.write(global.db);
        
        res.json({
            status: 'success',
            data: global.db.settings
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Stats
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            users: Object.keys(global.db.users || {}).length,
            groups: Object.keys(global.db.groups || {}).length,
            premium: global.db.premium?.length || 0,
            sewa: global.db.sewa?.length || 0,
            totalCommands: global.db.hit?.totalcmd || 0,
            todayCommands: global.db.hit?.todaycmd || 0,
            games: Object.keys(global.db.game || {}).length,
            lastUpdate: new Date().toISOString()
        };
        
        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Manual save
app.post('/api/save', async (req, res) => {
    try {
        await database.write(global.db);
        res.json({
            status: 'success',
            message: 'Database saved',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Refresh from database
app.post('/api/refresh', async (req, res) => {
    try {
        const freshData = await database.read();
        global.db = freshData;
        
        res.json({
            status: 'success',
            message: 'Database refreshed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Debug: lihat struktur user
app.get('/api/debug/user-structure/:jid?', (req, res) => {
    try {
        const { jid } = req.params;
        
        if (jid && global.db.users[jid]) {
            res.json({
                status: 'success',
                data: {
                    structure: Object.keys(global.db.users[jid]),
                    sample: global.db.users[jid]
                }
            });
        } else {
            res.json({
                status: 'success',
                data: {
                    defaultStructure: Object.keys(DatabaseStructure.user),
                    sampleUser: jid ? null : 'No JID provided',
                    note: 'Send JID to see specific user structure'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(chalk.red('Server error:'), err);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(chalk.green(`\n🚀 Server running on port ${PORT}`));
        console.log(chalk.cyan(`📝 API: http://localhost:${PORT}`));
        console.log(chalk.yellow(`💾 Database: ${database.isMongoDB() ? 'MongoDB' : 'JSON'}`));
        console.log(chalk.magenta(`📊 Users: ${Object.keys(global.db?.users || {}).length}`));
        console.log(chalk.magenta(`👥 Groups: ${Object.keys(global.db?.groups || {}).length}`));
    });
}

startServer().catch(console.error);
