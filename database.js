import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==================== STRUKTUR DATABASE LENGKAP ====================

export const DatabaseStructure = {
    // Struktur User yang LENGKAP (seperti defaultUser Anda)
    user: {
        _id: null,
        jid: null,
        
        profile: {
            name: '',
            nickname: '',
            age: null,
            birthDate: null,
            gender: '',
            location: {
                country: '',
                city: '',
                timezone: 'Asia/Jakarta',
                coordinates: {
                    lat: null,
                    lng: null
                }
            },
            bio: '',
            avatar: '',
            avatarFrame: '',
            cover: '',
            phoneNumber: '',
            email: '',
            isEmailVerified: false,
            isPhoneVerified: false,
            password: '',
            twoFactorEnabled: false,
            twoFactorSecret: null
        },
        
        settings: {
            language: 'id',
            theme: 'dark',
            notifications: {
                whatsapp: true,
                email: true,
                web: true,
                dailyReward: true,
                petHungry: true,
                spinAvailable: true
            },
            privacy: {
                showLastSeen: true,
                showProfilePhoto: true,
                showOnlineStatus: true,
                showInventory: false,
                showPet: true
            },
            website: {
                autoClaimDaily: false,
                defaultView: 'dashboard',
                compactMode: false
            }
        },
        
        account: {
            level: 1,
            exp: 0,
            nextLevelExp: 100,
            rank: 1,
            title: 'Petualang Pemula',
            titleColor: '#FFD700',
            badges: [],
            vip: {
                isVip: false,
                type: null,
                expiryDate: null,
                benefits: []
            },
            premium: {
                isPremium: false,
                expiryDate: null,
                subscriptionId: null
            },
            banned: {
                isBanned: false,
                reason: null,
                bannedUntil: null,
                bannedBy: null,
                appealMessage: null
            },
            registered: false,
            registrationDate: null,
            lastUsernameChange: null,
            usernameChangeLeft: 3
        },
        
        economy: {
            currencies: {
                money: 1000,
                bank: 0,
                crystals: 10,
                gems: 0,
                tickets: {
                    spin: 1,
                    gacha: 0,
                    event: 0,
                    raid: 0
                },
                coins: {
                    bronze: 0,
                    silver: 0,
                    gold: 0,
                    platinum: 0
                }
            },
            debt: 0,
            loan: {
                amount: 0,
                dueDate: null,
                interest: 0.1,
                collateral: null
            },
            totalEarned: 0,
            totalSpent: 0,
            lastTransaction: null,
            transactionHistory: []
        },
        
        inventory: {
            items: [],
            capacity: 50,
            maxCapacity: 100,
            weight: 0,
            maxWeight: 100,
            equipped: {
                weapon: null,
                armor: null,
                accessory1: null,
                accessory2: null,
                pet: null
            },
            materials: {
                wood: 0,
                stone: 0,
                iron: 0,
                leather: 0,
                herbs: 0
            },
            recipes: []
        },
        
        pets: {
            active: null,
            collection: [],
            inventory: {
                food: {
                    basic_food: 0,
                    premium_food: 0,
                    treats: 0
                },
                toys: [],
                medicine: {
                    potion: 0
                }
            },
            stable: {
                capacity: 5,
                upgradeLevel: 1,
                decorations: []
            }
        },
        
        spin: {
            dailySpins: {
                available: 1,
                used: 0,
                lastSpin: null,
                streak: 0
            },
            premiumSpins: {
                tickets: 0,
                available: true
            },
            wheel: {
                currentMultiplier: 1,
                specialWheel: false,
                customPrizes: []
            },
            history: [],
            spinStats: {
                totalSpins: 0,
                bestPrize: '',
                rarePrizes: 0
            }
        },
        
        gacha: {
            banners: {
                standard: {
                    pulls: 0,
                    pity: 0,
                    guaranteed: false
                },
                limited: {
                    pulls: 0,
                    pity: 0,
                    tickets: 0,
                    bannerId: null
                }
            },
            history: []
        },
        
        dailyRewards: {
            currentDay: 1,
            lastClaim: null,
            streak: 0,
            maxStreak: 0,
            available: true,
            calendar: {
                day1: false, day2: false, day3: false, day4: false, day5: false, day6: false, day7: false,
                day8: false, day9: false, day10: false, day11: false, day12: false, day13: false, day14: false,
                day15: false, day16: false, day17: false, day18: false, day19: false, day20: false, day21: false,
                day22: false, day23: false, day24: false, day25: false, day26: false, day27: false, day28: false,
                day29: false, day30: false, day31: false
            },
            bonus: {
                weeklyBonus: false,
                monthlyBonus: false
            }
        },
        
        quests: {
            daily: [],
            weekly: [],
            achievements: {}
        },
        
        games: {
            stats: {
                totalPlayed: 0,
                totalWins: 0,
                winRate: 0
            },
            susunKata: {
                highScore: 0,
                totalPlayed: 0,
                totalWins: 0,
                lastPlayed: null,
                currentWrongAttempts: 0,
                leaderboardRank: 0
            },
            tebakGambar: {
                highScore: 0,
                totalPlayed: 0,
                totalWins: 0,
                lastPlayed: null
            },
            slotMachine: {
                totalSpins: 0,
                totalWin: 0,
                totalLose: 0,
                lastSpin: null,
                biggestWin: 0
            },
            rpg: {
                character: {
                    class: 'warrior',
                    hp: 100,
                    mp: 50,
                    stamina: 100,
                    strength: 10,
                    defense: 10,
                    magic: 10,
                    agility: 10
                },
                dungeon: {
                    currentFloor: 1,
                    highestFloor: 1,
                    attempts: 0
                }
            }
        },
        
        social: {
            friends: [],
            blockedUsers: [],
            guild: {
                id: null,
                name: null,
                role: null,
                joinedAt: null,
                contribution: 0
            },
            reputation: {
                points: 0,
                given: 0,
                received: 0,
                topGivers: []
            },
            karma: 0,
            marriage: {
                partner: null,
                marriedSince: null,
                ring: null
            }
        },
        
        limits: {
            daily: {
                commands: { max: 100, used: 0, reset: null },
                spins: { max: 1, used: 0 },
                gacha: { max: 10, used: 0 },
                pvp: { max: 5, used: 0 }
            },
            global: {
                commands: 1000,
                messages: 5000
            },
            cooldowns: {
                beg: 0,
                rob: 0,
                daily: 0,
                work: 0,
                fish: 0,
                pvp: 0,
                spin: 0
            }
        },
        
        website: {
            sessions: [],
            lastVisit: null,
            visitedPages: [],
            pageViews: 0,
            timeSpent: 0,
            preferences: {
                emailNotifications: true,
                newsletter: false,
                darkMode: true,
                autoPlay: false
            },
            dailyVisits: [],
            spinPage: {
                lastVisit: null,
                totalVisits: 0,
                spinsFromWeb: 0
            },
            petPage: {
                lastInteraction: null,
                upgradesDone: 0,
                foodGiven: 0
            }
        },
        
        shop: {
            purchases: [],
            cart: [],
            wishlist: [],
            totalSpent: 0,
            lastPurchase: null
        },
        
        leaderboard: {
            rankings: {
                level: 0,
                wealth: 0,
                petLevel: 0,
                games: 0
            },
            points: {
                weekly: 0,
                monthly: 0,
                allTime: 0
            },
            season: {
                current: null,
                points: 0,
                tier: 'bronze'
            }
        },
        
        stats: {
            messagesSent: 0,
            commandsUsed: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            dailyStreak: 0,
            longestStreak: 0,
            lastActive: null,
            totalOnlineTime: 0,
            referrals: 0,
            referralCode: null,
            warnings: 0,
            mutes: 0,
            profileViews: 0,
            friendRequests: 0
        },
        
        logs: {
            lastLogin: null,
            lastLogout: null,
            registrationIp: null,
            loginHistory: [],
            actionLogs: [],
            economyLogs: []
        },
        
        timestamps: {
            createdAt: null,
            updatedAt: null,
            lastClaim: 0,
            lastBeg: 0,
            lastRob: 0,
            lastDaily: 0,
            lastWork: 0,
            lastSpin: 0,
            lastPetFeed: null,
            lastPetPlay: null
        },
        
        metadata: {
            version: 2,
            customFields: {},
            flags: [],
            notes: '',
            tags: []
        }
    },

    // Struktur Group
    group: {
        url: '',
        pc: 0,
        text: {},
        warn: {},
        tagsw: {},
        auto: {
            gempa: { enable: false, data: '' },
            berita: { enable: false, data: '' },
            cuaca: { enable: false, data: '' },
            jadwalsholat: { enable: false, data: '' },
            saham: { enable: false, data: '' }
        },
        nsfw: false,
        antiporhub: false,
        mute: false,
        leave: false,
        setinfo: false,
        antilink: false,
        demote: false,
        antitoxic: false,
        promote: false,
        welcome: false,
        antivirtex: false,
        antitagsw: false,
        antidelete: false,
        antihidetag: false,
        waktusholat: false
    },

    // Struktur Game
    game: {
        suit: {},
        chess: {},
        chat_ai: {},
        siapakahaku: {},
        menfes: {},
        tekateki: {},
        akinator: {},
        tictactoe: {},
        tebaklirik: {},
        kuismath: {},
        blackjack: {},
        tebaklagu: {},
        tebakkata: {},
        family100: {},
        susunkata: {},
        tebakbom: {},
        ulartangga: {},
        tebakkimia: {},
        caklontong: {},
        tebakangka: {},
        tebaknegara: {},
        tebakgambar: {},
        tebakbendera: {}
    },

    // Struktur Settings Bot
    set: {
        lang: 'id',
        limit: 0,
        money: 0,
        status: 0,
        join: false,
        public: false,
        anticall: false,
        original: false,
        readsw: false,
        autobio: false,
        autoread: false,
        antispam: false,
        autotyping: false,
        grouponly: false,
        multiprefix: false,
        privateonly: false,
        author: 'ditss',
        autobackup: false,
        botname: 'Asuma Bot',
        packname: 'Asuma MD',
        template: 'documentMessage'
    }
};

// ==================== CLASS MONGODB ====================

class MongoDB {
    constructor(url = process.env.MONGODB_URI) {
        this.url = url;
        this._model = null;
        this.isConnecting = false;
        this.isReconnecting = false;
        this.changeStream = null;
        this.listeners = [];

        mongoose.connection.on('disconnected', async () => {
            if (this.isReconnecting) return;
            this.isReconnecting = true;
            console.log(chalk.yellow('❗ MongoDB connection lost. Attempting to reconnect in 5 seconds...'));
            await new Promise(resolve => setTimeout(resolve, 5000));
            await this.connect();
        });
    }

    connect = async (retries = 3) => {
        if (mongoose.connection.readyState === 1) {
            console.log(chalk.green('✅ MongoDB is already connected.'));
            return;
        }
        if (this.isConnecting) return;
        
        this.isConnecting = true;
        
        for (let i = 1; i <= retries; i++) {
            try {
                console.log(chalk.blue(`🔄 Connecting to MongoDB... (Attempt ${i}/${retries})`));
                await mongoose.connect(this.url, {
                    serverSelectionTimeoutMS: 5000
                });
                
                if (!this._model) {
                    const schema = new mongoose.Schema({
                        data: { type: mongoose.Schema.Types.Mixed, required: true, default: {} }
                    }, {
                        timestamps: true
                    });
                    this._model = mongoose.models.data || mongoose.model('data', schema);
                }
                
                console.log(chalk.green('✅ Successfully connected to MongoDB.'));
                this.isConnecting = false;
                this.isReconnecting = false;
                
                // Aktifkan change stream setelah koneksi sukses
                setTimeout(() => this.startChangeStream(), 2000);
                return;
            } catch (e) {
                console.log(chalk.red(`❌ MongoDB connection failed: ${e.message}`));
                if (i < retries) {
                    console.log(chalk.yellow(`⏳ Retrying in ${i * 2} seconds...`));
                    await new Promise(resolve => setTimeout(resolve, i * 2000));
                }
            }
        }
        
        this.isConnecting = false;
        throw new Error('❌ MongoDB connection failed after multiple attempts.');
    }

    read = async () => {
        if (mongoose.connection.readyState !== 1) {
            await this.connect();
        }
        
        try {
            let doc = await this._model.findOne({});
            if (!doc) {
                // Buat struktur database default
                const defaultData = {
                    hit: {},
                    set: {},
                    stats: {},
                    cmd: {},
                    store: {},
                    users: {},
                    game: DatabaseStructure.game,
                    groups: {},
                    database: {},
                    premium: [],
                    sewa: [],
                    settings: {
                        maintenance: false,
                        version: '2.0.0'
                    }
                };
                doc = new this._model({ data: defaultData });
                await doc.save();
                return defaultData;
            }
            
            // Parse data jika string
            if (typeof doc.data === 'string') {
                return JSON.parse(doc.data);
            }
            return doc.data || {};
        } catch (error) {
            console.error(chalk.red('❌ Error reading from MongoDB:'), error);
            throw error;
        }
    }

    write = async (data) => {
        if (!data) return;
        if (mongoose.connection.readyState !== 1) {
            await this.connect();
        }
        
        try {
            // Bersihkan data dari circular references
            const cleanData = JSON.parse(JSON.stringify(data));
            
            await this._model.findOneAndUpdate(
                {}, 
                { data: cleanData }, 
                { 
                    upsert: true, 
                    returnDocument: 'after', 
                    setDefaultsOnInsert: true 
                }
            );
            
            // Notify listeners about write
            this.notifyListeners('write', cleanData);
            
        } catch (error) {
            console.error(chalk.red('❌ Error writing to MongoDB:'), error);
            throw error;
        }
    }

    startChangeStream = () => {
        if (mongoose.connection.readyState !== 1) {
            console.log(chalk.yellow('⚠️ Cannot start change stream: MongoDB not connected'));
            return;
        }
        
        if (this.changeStream) {
            this.changeStream.close();
        }
        
        try {
            const collection = this._model.collection;
            this.changeStream = collection.watch();

            this.changeStream.on('change', async (change) => {
                console.log(chalk.cyan(`📡 Change detected: ${change.operationType}`));
                
                if (['update', 'replace', 'insert', 'delete'].includes(change.operationType)) {
                    try {
                        const newData = await this.read();
                        this.notifyListeners('change', newData);
                    } catch (err) {
                        console.error(chalk.red('❌ Error reading after change:'), err);
                    }
                }
            });

            this.changeStream.on('error', (err) => {
                console.error(chalk.red('❌ Change stream error:'), err);
                setTimeout(() => {
                    console.log(chalk.yellow('🔄 Reconnecting change stream...'));
                    this.startChangeStream();
                }, 5000);
            });

            this.changeStream.on('close', () => {
                console.log(chalk.yellow('⚠️ Change stream closed, reconnecting...'));
                setTimeout(() => {
                    this.startChangeStream();
                }, 5000);
            });

            console.log(chalk.green('✅ Change stream listening for real-time updates'));
        } catch (error) {
            console.error(chalk.red('❌ Failed to start change stream:'), error);
        }
    }

    // Listener system
    addListener = (callback) => {
        this.listeners.push(callback);
    }

    notifyListeners = (type, data) => {
        this.listeners.forEach(callback => {
            try {
                callback(type, data);
            } catch (err) {
                console.error(chalk.red('❌ Error in listener:'), err);
            }
        });
    }

    isMongoDB = () => true
}

// ==================== CLASS JSONDB (FALLBACK) ====================

class JsonDB {
    constructor(file = 'database.json') {
        this.data = {};
        this.file = join(process.cwd(), 'database', file);
        this.isWriting = false;
        this.writePending = false;
        this.listeners = [];
    }

    read = async () => {
        try {
            if (fs.existsSync(this.file)) {
                const data = JSON.parse(fs.readFileSync(this.file, 'utf-8'));
                return data;
            } else {
                const dir = dirname(this.file);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                // Buat struktur default
                const defaultData = {
                    hit: {},
                    set: {},
                    stats: {},
                    cmd: {},
                    store: {},
                    users: {},
                    game: DatabaseStructure.game,
                    groups: {},
                    database: {},
                    premium: [],
                    sewa: [],
                    settings: {
                        maintenance: false,
                        version: '2.0.0'
                    }
                };
                
                fs.writeFileSync(this.file, JSON.stringify(defaultData, null, 2));
                return defaultData;
            }
        } catch (e) {
            console.error(chalk.red('❌ Error reading JSON DB:'), e);
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
            
            if (fs.existsSync(this.file)) {
                fs.copyFileSync(this.file, this.file + '.backup');
            }
            
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
            
            // Notify listeners
            this.notifyListeners('write', this.data);
            
        } catch (e) {
            console.error(chalk.red('❌ Write Database failed: '), e);
        } finally {
            this.isWriting = false;
            if (this.writePending) {
                this.writePending = false;
                await this.write(this.data);
            }
        }
    }

    // Watch file for changes (polling for JSON)
    startWatching = (callback) => {
        this.addListener(callback);
        
        // Polling every 2 seconds
        setInterval(async () => {
            try {
                const newData = await this.read();
                this.notifyListeners('poll', newData);
            } catch (err) {
                console.error(chalk.red('❌ Error polling JSON:'), err);
            }
        }, 2000);
    }

    addListener = (callback) => {
        this.listeners.push(callback);
    }

    notifyListeners = (type, data) => {
        this.listeners.forEach(callback => {
            try {
                callback(type, data);
            } catch (err) {
                console.error(chalk.red('❌ Error in listener:'), err);
            }
        });
    }

    isMongoDB = () => false
}

// ==================== FACTORY FUNCTION ====================

const dataBase = (source) => {
    if (/^mongodb(\+srv)?:\/\//i.test(source)) {
        return new MongoDB(source);
    }
    return new JsonDB(source);
};

// ==================== UTILITY FUNCTIONS ====================

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

const cmdAdd = (hit) => {
    if (!hit) hit = {};
    hit.totalcmd = (hit.totalcmd || 0) + 1;
    hit.todaycmd = (hit.todaycmd || 0) + 1;
    return hit;
};

const cmdDel = (hit) => {
    if (hit) hit.todaycmd = 0;
    return hit;
};

const cmdAddHit = (hit, feature) => {
    if (!hit) hit = {};
    hit[feature] = (hit[feature] || 0) + 1;
    return hit;
};

const addExpired = ({ id, expired, ...options }, _dir) => {
    const _cek = _dir.find((a) => a.id == id);
    const expiredTime = toMs(expired);
    
    if (_cek) {
        _cek.expired = _cek.expired + expiredTime;
    } else {
        _dir.push({ id, expired: Date.now() + expiredTime, ...options });
    }
    return _dir;
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
                console.log(chalk.yellow(`⏰ Expired: ${_dir[i].id}`));
                _dir.splice(i, 1);
            }
        }
    }, 5 * 60 * 1000);
};

// ==================== EXPORTS ====================

export {
    MongoDB,
    JsonDB,
    dataBase,
   // DatabaseStructure,
    cmdAdd,
    cmdDel,
    cmdAddHit,
    addExpired,
    getPosition,
    getStatus,
    getExpired,
    checkStatus,
    getAllExpired,
    checkExpired,
    toMs
};

export default dataBase;
