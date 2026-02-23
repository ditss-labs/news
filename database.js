import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MongoDB {
    constructor(url = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-database-asuma-bot-v1:ZkC0e1tsptBnKSZB@database-asuma-bot-v1.dm6gdlr.mongodb.net/?retryWrites=true&w=majority') {
        this.url = url;
        this._model = null;
        this.isConnecting = false;
        this.isReconnecting = false;
        this.changeStream = null;

        mongoose.connection.on('disconnected', async () => {
            if (this.isReconnecting) return;
            this.isReconnecting = true;
            console.warn('❗ MongoDB connection lost. Attempting to reconnect in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await this.connect();
        });
    }

    connect = async () => {
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB is already connected.');
            return;
        }
        if (this.isConnecting) return;
        
        this.isConnecting = true;
        try {
            console.log('🔄 Connecting to MongoDB...');
            await mongoose.connect(this.url, {
                serverSelectionTimeoutMS: 5000
            });
            
            if (!this._model) {
                const schema = new mongoose.Schema({
                    data: { type: Object, required: true, default: {} }
                }, {
                    timestamps: true
                });
                this._model = mongoose.models.data || mongoose.model('data', schema);
            }
            
            console.log('✅ Successfully connected to MongoDB.');
            this.isConnecting = false;
            this.isReconnecting = false;
        } catch (e) {
            console.error('❌ MongoDB connection failed:', e.message);
            this.isConnecting = false;
            throw e;
        }
    }

    read = async () => {
        if (mongoose.connection.readyState !== 1) {
            await this.connect();
        }
        
        let doc = await this._model.findOne({});
        if (!doc) {
            doc = new this._model({ data: {} });
            await doc.save();
        }
        
        try {
            // Handle jika data sudah berupa object atau masih string
            if (typeof doc.data === 'string') {
                return JSON.parse(doc.data);
            }
            return doc.data || {};
        } catch {
            return doc.data || {};
        }
    }

    write = async (data) => {
        if (!data) return;
        if (mongoose.connection.readyState !== 1) {
            await this.connect();
        }
        
        // Bersihkan data dari circular references dan _id
        const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
            if (key === '_id') return undefined;
            if (value && typeof value === 'object' && value._bsontype) return undefined;
            return value;
        }));
        
        await this._model.findOneAndUpdate(
            {}, 
            { data: cleanData }, 
            { 
                upsert: true, 
                returnDocument: 'after', 
                setDefaultsOnInsert: true 
            }
        );
    }

    listenChanges = (callback) => {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB belum terhubung');
        }
        
        if (this.changeStream) {
            this.changeStream.close();
        }
        
        const collection = this._model.collection;
        this.changeStream = collection.watch();

        this.changeStream.on('change', async (change) => {
            console.log('📡 Change detected:', change.operationType);
            if (['update', 'replace', 'insert', 'delete'].includes(change.operationType)) {
                try {
                    const newData = await this.read();
                    callback(newData);
                } catch (err) {
                    console.error('Gagal membaca data terbaru:', err);
                }
            }
        });

        this.changeStream.on('error', (err) => {
            console.error('❌ Change stream error:', err);
            setTimeout(() => {
                console.log('Mencoba reconnect change stream...');
                this.listenChanges(callback);
            }, 5000);
        });

        this.changeStream.on('close', () => {
            console.warn('⚠️ Change stream closed, reconnecting...');
            setTimeout(() => {
                this.listenChanges(callback);
            }, 5000);
        });

        console.log('✅ Change stream aktif dan mendengarkan...');
        return this.changeStream;
    }

    isMongoDB = () => true
}

class JsonDB {
    constructor(file = 'database.json') {
        this.data = {};
        this.file = join(process.cwd(), 'database', file);
        this.isWriting = false;
        this.writePending = false;
    }

    read = async () => {
        try {
            if (fs.existsSync(this.file)) {
                const data = JSON.parse(fs.readFileSync(this.file, 'utf-8'));
                return data;
            } else {
                // Buat direktori jika belum ada
                const dir = dirname(this.file);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                // Buat file baru dengan data kosong
                fs.writeFileSync(this.file, JSON.stringify({}, null, 2));
                return {};
            }
        } catch (e) {
            console.error('❌ Error reading JSON DB:', e);
            return {};
        }
    }

    write = async (data) => {
        this.data = data || {};
        
        if (this.isWriting) {
            this.writePending = true;
            return;
        }
        
        this.isWriting = true;
        try {
            const dir = dirname(this.file);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Backup file lama jika ada
            if (fs.existsSync(this.file)) {
                fs.copyFileSync(this.file, this.file + '.backup');
            }
            
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.error('❌ Write Database failed: ', e);
        } finally {
            this.isWriting = false;
            if (this.writePending) {
                this.writePending = false;
                await this.write(this.data);
            }
        }
    }

    isMongoDB = () => false
}

// Factory function untuk memilih database
const dataBase = (source) => {
    if (/^mongodb(\+srv)?:\/\//i.test(source)) {
        return new MongoDB(source);
    }
    return new JsonDB(source);
};

// Fungsi-fungsi utilitas
const cmdAdd = (hit) => {
    if (hit && !hit.totalcmd) hit.totalcmd = 0;
    if (hit && !hit.todaycmd) hit.todaycmd = 0;
    hit.totalcmd = (hit.totalcmd || 0) + 1;
    hit.todaycmd = (hit.todaycmd || 0) + 1;
};

const cmdDel = (hit) => {
    if (hit) hit.todaycmd = 0;
};

const cmdAddHit = (hit, feature) => {
    if (!hit) return;
    hit[feature] = (hit[feature] || 0) + 1;
};

const toMs = (time) => {
    const match = time.match(/^(\d+)([dhms])$/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return 0;
    }
};

const addExpired = ({ id, expired, ...options }, _dir) => {
    const _cek = _dir.find((a) => a.id == id);
    const expiredTime = toMs(expired);
    
    if (_cek) {
        _cek.expired = _cek.expired + expiredTime;
    } else {
        _dir.push({ id, expired: Date.now() + expiredTime, ...options });
    }
};

const getPosition = (id, _dir) => _dir.findIndex(a => a.id === id || a.url === id);
const getExpired = (id, _dir) => {
    const item = _dir.find(a => a.id === id || a.url === id);
    return item ? item.expired : null;
};
const getStatus = (id, _dir) => _dir.find(a => a.id === id || a.url === id);
const checkStatus = (id, _dir) => _dir.some(a => a.id === id || a.url === id);
const getAllExpired = (_dir) => _dir.map(a => a.id);

const checkExpired = (_dir, conn) => {
    setInterval(() => {
        const now = Date.now();
        for (let i = _dir.length - 1; i >= 0; i--) {
            if (now >= _dir[i].expired) {
                if (conn && conn.groupLeave) {
                    conn.groupLeave(_dir[i].id).catch(() => {});
                }
                console.log(`Expired: ${_dir[i].id}`);
                _dir.splice(i, 1);
            }
        }
    }, 5 * 60 * 1000);
};

export {
    MongoDB,
    JsonDB,
    dataBase,
    cmdAdd,
    cmdDel,
    cmdAddHit,
    addExpired,
    getPosition,
    getStatus,
    getExpired,
    checkStatus,
    getAllExpired,
    checkExpired
};

export default dataBase;
