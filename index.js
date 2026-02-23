import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { dataBase, DatabaseStructure } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inisialisasi database
const dbSource = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-database-asuma-bot-v1:ZkC0e1tsptBnKSZB@database-asuma-bot-v1.dm6gdlr.mongodb.net/?retryWrites=true&w=majority';
const database = dataBase(dbSource);

// Global db object
global.db = null;

// Inisialisasi database
async function initDatabase() {
    try {
        console.log(chalk.blue('🔄 Initializing database...'));
        
        // Koneksi ke MongoDB
        if (database.isMongoDB()) {
            await database.connect();
        }
        
        // Baca data
        let loadData = await database.read();
        
        console.log(chalk.cyan(`📦 Database loaded: ${Object.keys(loadData).join(', ')}`));
        
        if (!loadData || Object.keys(loadData).length === 0) {
            // Buat database baru dengan struktur lengkap
            global.db = {
                hit: { totalcmd: 0, todaycmd: 0 },
                set: {},
                stats: {},
                cmd: {},
                store: {},
                users: {},
                game: JSON.parse(JSON.stringify(DatabaseStructure.game)),
                groups: {},
                database: {},
                premium: [],
                sewa: [],
                settings: {
                    maintenance: false,
                    version: '2.0.0'
                }
            };
            await database.write(global.db);
            console.log(chalk.green('✅ Database baru dibuat!'));
        } else {
            // Merge dengan struktur default untuk memastikan semua field ada
            global.db = {
                hit: loadData.hit || { totalcmd: 0, todaycmd: 0 },
                set: loadData.set || {},
                stats: loadData.stats || {},
                cmd: loadData.cmd || {},
                store: loadData.store || {},
                users: loadData.users || {},
                game: { ...DatabaseStructure.game, ...(loadData.game || {}) },
                groups: loadData.groups || {},
                database: loadData.database || {},
                premium: Array.isArray(loadData.premium) ? loadData.premium : [],
                sewa: Array.isArray(loadData.sewa) ? loadData.sewa : [],
                settings: loadData.settings || {
                    maintenance: false,
                    version: '2.0.0'
                }
            };
            
            console.log(chalk.green('✅ Database loaded!'));
            console.log(chalk.yellow(`📊 Stats: ${Object.keys(global.db.users).length} users, ${Object.keys(global.db.groups).length} groups, ${global.db.premium.length} premium`));
        }

        // Setup real-time updates jika MongoDB
        if (database.isMongoDB()) {
            database.addListener((type, data) => {
                if (type === 'change' || type === 'write') {
                    // Update global.db dengan data terbaru
                    global.db = data;
                    console.log(chalk.yellow('🔄 Database updated real-time'));
                }
            });
        } else {
            // Untuk JSON DB, gunakan polling
            database.startWatching((type, data) => {
                if (type === 'poll' || type === 'write') {
                    global.db = data;
                    console.log(chalk.yellow('🔄 Database updated via polling'));
                }
            });
        }

        // Auto save setiap 30 detik
        setInterval(async () => {
            if (global.db) {
                await database.write(global.db);
                console.log(chalk.gray('💾 Database auto-saved'));
            }
        }, 30000);

    } catch (e) {
        console.error(chalk.red('❌ Database error:'), e);
        process.exit(1);
    }
}

// ==================== API ROUTES ====================

// Home
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Asuma Bot Database API',
        version: global.db?.settings?.version || '2.0.0',
        stats: {
            users: Object.keys(global.db?.users || {}).length,
            groups: Object.keys(global.db?.groups || {}).length,
            premium: global.db?.premium?.length || 0,
            sewa: global.db?.sewa?.length || 0
        },
        timestamp: new Date().toISOString()
    });
});

// Get all database
app.get('/api/db', (req, res) => {
    try {
        res.json({
            status: 'success',
            data: global.db
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get specific collection
app.get('/api/db/:collection', (req, res) => {
    try {
        const { collection } = req.params;
        
        if (!global.db[collection]) {
            return res.status(404).json({
                status: 'error',
                message: `Collection '${collection}' not found`
            });
        }
        
        res.json({
            status: 'success',
            collection,
            count: Array.isArray(global.db[collection]) ? global.db[collection].length : Object.keys(global.db[collection]).length,
            data: global.db[collection]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get user by JID
app.get('/api/users/:jid', (req, res) => {
    try {
        const { jid } = req.params;
        const user = global.db.users?.[jid];
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: `User ${jid} not found`
            });
        }
        
        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update user
app.post('/api/users/:jid', async (req, res) => {
    try {
        const { jid } = req.params;
        const updateData = req.body;
        
        if (!global.db.users) {
            global.db.users = {};
        }
        
        if (!global.db.users[jid]) {
            // Buat user baru dengan struktur lengkap
            const newUser = JSON.parse(JSON.stringify(DatabaseStructure.user));
            newUser._id = jid;
            newUser.jid = jid;
            newUser.profile.name = updateData.profile?.name || 'User';
            newUser.account.registrationDate = Date.now();
            newUser.timestamps.createdAt = Date.now();
            global.db.users[jid] = newUser;
        }
        
        // Merge update data
        const mergeDeep = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeDeep(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        };
        
        mergeDeep(global.db.users[jid], updateData);
        global.db.users[jid].timestamps.updatedAt = Date.now();
        
        // Simpan ke database
        await database.write(global.db);
        
        res.json({
            status: 'success',
            message: 'User updated',
            data: global.db.users[jid]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get group by ID
app.get('/api/groups/:groupId', (req, res) => {
    try {
        const { groupId } = req.params;
        const group = global.db.groups?.[groupId];
        
        if (!group) {
            return res.status(404).json({
                status: 'error',
                message: `Group ${groupId} not found`
            });
        }
        
        res.json({
            status: 'success',
            data: group
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Premium list
app.get('/api/premium', (req, res) => {
    try {
        res.json({
            status: 'success',
            count: global.db.premium?.length || 0,
            data: global.db.premium || []
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Add premium
app.post('/api/premium/add', async (req, res) => {
    try {
        const { jid, duration } = req.body;
        
        if (!jid || !duration) {
            return res.status(400).json({
                status: 'error',
                message: 'JID and duration required'
            });
        }
        
        if (!global.db.premium) {
            global.db.premium = [];
        }
        
        if (!global.db.premium.includes(jid)) {
            global.db.premium.push(jid);
        }
        
        // Update user premium status if exists
        if (global.db.users[jid]) {
            global.db.users[jid].account.premium.isPremium = true;
            global.db.users[jid].account.premium.expiryDate = Date.now() + toMs(duration);
        }
        
        await database.write(global.db);
        
        res.json({
            status: 'success',
            message: 'Premium added',
            data: global.db.premium
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
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
