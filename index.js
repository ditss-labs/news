import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dataBase } from './database.js';

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
        // Koneksi ke MongoDB
        if (database.isMongoDB()) {
            await database.connect();
        }
        
        // Baca data
        const loadData = await database.read();
        
        if (!loadData || Object.keys(loadData).length === 0) {
            global.db = {
                hit: {},
                set: {},
                stats: {},
                cmd: {},
                store: {},
                users: {},
                game: {},
                groups: {},
                database: {},
                premium: [],
                sewa: [],
                settings: {
                    maintenance: false,
                    version: '1.0.0'
                }
            };
            await database.write(global.db);
            console.log('✅ Database baru dibuat!');
        } else {
            global.db = {
                hit: loadData.hit || {},
                set: loadData.set || {},
                stats: loadData.stats || {},
                cmd: loadData.cmd || {},
                store: loadData.store || {},
                users: loadData.users || {},
                game: loadData.game || {},
                groups: loadData.groups || {},
                database: loadData.database || {},
                premium: loadData.premium || [],
                sewa: loadData.sewa || [],
                settings: loadData.settings || {
                    maintenance: false,
                    version: '1.0.0'
                }
            };
            console.log('✅ Database loaded!');
        }

        // Auto save setiap 30 detik
        setInterval(async () => {
            if (global.db) {
                await database.write(global.db);
                console.log('💾 Database auto-saved');
            }
        }, 30000);

    } catch (e) {
        console.error('❌ Database error:', e);
        process.exit(1);
    }
}

// Routes
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Database Bot WhatsApp',
        version: global.db?.settings?.version || '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Get all data
app.get('/api/db', async (req, res) => {
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
app.get('/api/db/:collection', async (req, res) => {
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
            data: global.db[collection]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update specific collection
app.post('/api/db/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const updateData = req.body;
        
        if (!global.db[collection]) {
            global.db[collection] = {};
        }
        
        // Merge data
        global.db[collection] = {
            ...global.db[collection],
            ...updateData
        };
        
        // Simpan ke database
        await database.write(global.db);
        
        res.json({
            status: 'success',
            message: `Collection '${collection}' updated`,
            data: global.db[collection]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update specific field in collection
app.put('/api/db/:collection/:field', async (req, res) => {
    try {
        const { collection, field } = req.params;
        const { value } = req.body;
        
        if (!global.db[collection]) {
            global.db[collection] = {};
        }
        
        global.db[collection][field] = value;
        
        // Simpan ke database
        await database.write(global.db);
        
        res.json({
            status: 'success',
            message: `Field '${field}' in '${collection}' updated`,
            data: { [field]: global.db[collection][field] }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Delete collection
app.delete('/api/db/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        
        if (global.db[collection]) {
            delete global.db[collection];
            
            // Simpan ke database
            await database.write(global.db);
            
            res.json({
                status: 'success',
                message: `Collection '${collection}' deleted`
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: `Collection '${collection}' not found`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Users endpoints
app.get('/api/users/:number', async (req, res) => {
    try {
        const { number } = req.params;
        const user = global.db.users?.[number] || null;
        
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

app.post('/api/users/:number', async (req, res) => {
    try {
        const { number } = req.params;
        const userData = req.body;
        
        if (!global.db.users) {
            global.db.users = {};
        }
        
        global.db.users[number] = {
            ...global.db.users[number],
            ...userData,
            lastUpdate: new Date().toISOString()
        };
        
        await database.write(global.db);
        
        res.json({
            status: 'success',
            data: global.db.users[number]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Groups endpoints
app.get('/api/groups/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = global.db.groups?.find(g => g.id === groupId) || null;
        
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

// Premium endpoints
app.get('/api/premium/list', async (req, res) => {
    try {
        res.json({
            status: 'success',
            data: global.db.premium || []
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.post('/api/premium/add', async (req, res) => {
    try {
        const { id, expired } = req.body;
        
        if (!id || !expired) {
            return res.status(400).json({
                status: 'error',
                message: 'ID and expired are required'
            });
        }
        
        if (!global.db.premium) {
            global.db.premium = [];
        }
        
        const existing = global.db.premium.find(p => p.id === id);
        if (existing) {
            existing.expired = Date.now() + toMs(expired);
        } else {
            global.db.premium.push({
                id,
                expired: Date.now() + toMs(expired)
            });
        }
        
        await database.write(global.db);
        
        res.json({
            status: 'success',
            message: 'Premium added/updated',
            data: global.db.premium
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Sewa endpoints
app.get('/api/sewa/list', async (req, res) => {
    try {
        res.json({
            status: 'success',
            data: global.db.sewa || []
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
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

app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        
        global.db.settings = {
            ...global.db.settings,
            ...settings
        };
        
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

// Maintenance mode toggle
app.post('/api/maintenance', async (req, res) => {
    try {
        const { enabled } = req.body;
        
        if (!global.db.settings) {
            global.db.settings = {};
        }
        
        global.db.settings.maintenance = enabled === true;
        
        await database.write(global.db);
        
        res.json({
            status: 'success',
            maintenance: global.db.settings.maintenance
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Stats endpoints
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {
            totalUsers: Object.keys(global.db.users || {}).length,
            totalGroups: (global.db.groups || []).length,
            totalPremium: (global.db.premium || []).length,
            totalSewa: (global.db.sewa || []).length,
            totalCommands: global.db.hit?.totalcmd || 0,
            todayCommands: global.db.hit?.todaycmd || 0,
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
            message: 'Database saved manually',
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
        
        global.db = {
            hit: freshData.hit || {},
            set: freshData.set || {},
            stats: freshData.stats || {},
            cmd: freshData.cmd || {},
            store: freshData.store || {},
            users: freshData.users || {},
            game: freshData.game || {},
            groups: freshData.groups || {},
            database: freshData.database || {},
            premium: freshData.premium || [],
            sewa: freshData.sewa || [],
            settings: freshData.settings || global.db.settings || {}
        };
        
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

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
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
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 API Documentation: http://localhost:${PORT}`);
        console.log(`💾 Database: ${database.isMongoDB() ? 'MongoDB' : 'JSON'}`);
    });
}

startServer().catch(console.error);
