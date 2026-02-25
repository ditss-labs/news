import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  jid: { type: String, required: true },
  
  profile: {
    name: { type: String, default: '' },
    nickname: { type: String, default: '' },
    age: { type: Number, default: null },
    birthDate: { type: Date, default: null },
    gender: { type: String, default: '' },
    location: {
      country: { type: String, default: '' },
      city: { type: String, default: '' },
      timezone: { type: String, default: 'Asia/Jakarta' },
      coordinates: { type: Map, of: Number, default: {} }
    },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    avatarFrame: { type: String, default: '' },
    cover: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    password: { type: String, default: '' },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: '' }
  },

  settings: {
    language: { type: String, default: 'id' },
    theme: { type: String, default: 'dark' },
    notifications: {
      whatsapp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      web: { type: Boolean, default: true },
      dailyReward: { type: Boolean, default: true },
      petHungry: { type: Boolean, default: true },
      spinAvailable: { type: Boolean, default: true }
    },
    privacy: {
      showLastSeen: { type: Boolean, default: true },
      showProfilePhoto: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      showInventory: { type: Boolean, default: false },
      showPet: { type: Boolean, default: true }
    },
    website: {
      autoClaimDaily: { type: Boolean, default: false },
      defaultView: { type: String, default: 'dashboard' },
      compactMode: { type: Boolean, default: false }
    }
  },

  account: {
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    nextLevelExp: { type: Number, default: 100 },
    rank: { type: Number, default: 1 },
    title: { type: String, default: 'Petualang Pemula' },
    titleColor: { type: String, default: '#FFD700' },
    badges: { type: [String], default: [] },
    vip: {
      isVip: { type: Boolean, default: false },
      type: { type: String, default: '' },
      expiryDate: { type: Date, default: null },
      benefits: { type: [String], default: [] }
    },
    premium: {
      isPremium: { type: Boolean, default: false },
      expiryDate: { type: Date, default: null },
      subscriptionId: { type: String, default: '' }
    },
    banned: {
      isBanned: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      bannedUntil: { type: Date, default: null },
      bannedBy: { type: String, default: '' },
      appealMessage: { type: String, default: '' }
    },
    registered: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now },
    lastUsernameChange: { type: Date, default: Date.now },
    usernameChangeLeft: { type: Number, default: 3 }
  },

  economy: {
    currencies: {
      money: { type: Number, default: 0 },
      bank: { type: Number, default: 0 },
      crystals: { type: Number, default: 0 },
      gems: { type: Number, default: 0 },
      tickets: { type: Map, of: Number, default: {} },
      coins: { type: Map, of: Number, default: {} }
    },
    debt: { type: Number, default: 0 },
    loan: {
      amount: { type: Number, default: 0 },
      dueDate: { type: Date, default: null },
      interest: { type: Number, default: 0.1 },
      collateral: { type: String, default: '' }
    },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastTransaction: { type: Date, default: null },
    transactionHistory: { type: [{
      type: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      description: { type: String, default: '' },
      date: { type: Date, default: Date.now }
    }], default: [] }
  },

  inventory: {
    items: { type: [{
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      quantity: { type: Number, default: 0 },
      type: { type: String, default: '' },
      rarity: { type: String, default: '' },
      durability: { type: Number, default: 0 },
      equipped: { type: Boolean, default: false }
    }], default: [] },
    capacity: { type: Number, default: 50 },
    maxCapacity: { type: Number, default: 100 },
    weight: { type: Number, default: 0 },
    maxWeight: { type: Number, default: 100 },
    equipped: {
      weapon: { type: String, default: '' },
      armor: { type: String, default: '' },
      accessory1: { type: String, default: '' },
      accessory2: { type: String, default: '' },
      pet: { type: String, default: '' }
    },
    materials: {
      wood: { type: Number, default: 0 },
      stone: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      leather: { type: Number, default: 0 },
      herbs: { type: Number, default: 0 }
    },
    recipes: { type: [String], default: [] }
  },

  pets: {
    active: { type: String, default: '' },
    collection: { type: [{
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      level: { type: Number, default: 1 },
      exp: { type: Number, default: 0 },
      hunger: { type: Number, default: 100 },
      happiness: { type: Number, default: 100 },
      skills: { type: [String], default: [] },
      equipped: { type: Boolean, default: false }
    }], default: [] },
    inventory: {
      food: { type: Map, of: Number, default: {} },
      toys: { type: [String], default: [] },
      medicine: { type: Map, of: Number, default: {} }
    },
    stable: {
      capacity: { type: Number, default: 5 },
      upgradeLevel: { type: Number, default: 1 },
      decorations: { type: [String], default: [] }
    }
  },

  spin: {
    dailySpins: {
      available: { type: Number, default: 1 },
      used: { type: Number, default: 0 },
      lastSpin: { type: Date, default: null },
      streak: { type: Number, default: 0 }
    },
    premiumSpins: {
      tickets: { type: Number, default: 0 },
      available: { type: Boolean, default: true }
    },
    wheel: {
      currentMultiplier: { type: Number, default: 1 },
      specialWheel: { type: Boolean, default: false },
      customPrizes: { type: [String], default: [] }
    },
    history: { type: [{
      date: { type: Date, default: Date.now },
      prize: { type: String, default: '' },
      type: { type: String, default: '' }
    }], default: [] },
    spinStats: {
      totalSpins: { type: Number, default: 0 },
      bestPrize: { type: String, default: '' },
      rarePrizes: { type: Number, default: 0 }
    }
  },

  gacha: {
    banners: {
      standard: {
        pulls: { type: Number, default: 0 },
        pity: { type: Number, default: 0 }
      },
      limited: {
        pulls: { type: Number, default: 0 },
        pity: { type: Number, default: 0 }
      }
    },
    history: { type: [{
      date: { type: Date, default: Date.now },
      banner: { type: String, default: '' },
      result: { type: String, default: '' },
      rarity: { type: String, default: '' }
    }], default: [] }
  },

  dailyRewards: {
    currentDay: { type: Number, default: 1 },
    lastClaim: { type: Date, default: null },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    calendar: {
      day1: { type: Boolean, default: false },
      day2: { type: Boolean, default: false },
      day3: { type: Boolean, default: false },
      day4: { type: Boolean, default: false },
      day5: { type: Boolean, default: false },
      day6: { type: Boolean, default: false },
      day7: { type: Boolean, default: false },
      day8: { type: Boolean, default: false },
      day9: { type: Boolean, default: false },
      day10: { type: Boolean, default: false },
      day11: { type: Boolean, default: false },
      day12: { type: Boolean, default: false },
      day13: { type: Boolean, default: false },
      day14: { type: Boolean, default: false },
      day15: { type: Boolean, default: false },
      day16: { type: Boolean, default: false },
      day17: { type: Boolean, default: false },
      day18: { type: Boolean, default: false },
      day19: { type: Boolean, default: false },
      day20: { type: Boolean, default: false },
      day21: { type: Boolean, default: false },
      day22: { type: Boolean, default: false },
      day23: { type: Boolean, default: false },
      day24: { type: Boolean, default: false },
      day25: { type: Boolean, default: false },
      day26: { type: Boolean, default: false },
      day27: { type: Boolean, default: false },
      day28: { type: Boolean, default: false },
      day29: { type: Boolean, default: false },
      day30: { type: Boolean, default: false },
      day31: { type: Boolean, default: false }
    },
    bonus: {
      weeklyBonus: { type: Boolean, default: false },
      monthlyBonus: { type: Boolean, default: false }
    }
  },

  quests: {
    daily: { type: [{
      id: { type: String, default: '' },
      title: { type: String, default: '' },
      progress: { type: Number, default: 0 },
      target: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      reward: { type: Object, default: {} }
    }], default: [] },
    weekly: { type: [{
      id: { type: String, default: '' },
      title: { type: String, default: '' },
      progress: { type: Number, default: 0 },
      target: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      reward: { type: Object, default: {} }
    }], default: [] },
    achievements: { type: Map, of: Boolean, default: {} }
  },

  games: {
    stats: {
      totalPlayed: { type: Number, default: 0 },
      totalWins: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 }
    },
    susunKata: {
      highScore: { type: Number, default: 0 },
      totalPlayed: { type: Number, default: 0 },
      totalWins: { type: Number, default: 0 },
      lastPlayed: { type: Date, default: null },
      currentWrongAttempts: { type: Number, default: 0 },
      leaderboardRank: { type: Number, default: 0 }
    },
    tebakGambar: {
      highScore: { type: Number, default: 0 },
      totalPlayed: { type: Number, default: 0 },
      totalWins: { type: Number, default: 0 },
      lastPlayed: { type: Date, default: null }
    },
    slotMachine: {
      totalSpins: { type: Number, default: 0 },
      totalWin: { type: Number, default: 0 },
      totalLose: { type: Number, default: 0 },
      lastSpin: { type: Date, default: null },
      biggestWin: { type: Number, default: 0 }
    },
    rpg: {
      character: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      dungeon: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
    }
  },

  social: {
    friends: { type: [String], default: [] },
    blockedUsers: { type: [String], default: [] },
    guild: {
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      joinedAt: { type: Date, default: null },
      contribution: { type: Number, default: 0 }
    },
    reputation: {
      points: { type: Number, default: 0 },
      given: { type: Number, default: 0 },
      received: { type: Number, default: 0 },
      topGivers: { type: [String], default: [] }
    },
    karma: { type: Number, default: 0 },
    marriage: {
      partner: { type: String, default: '' },
      marriedSince: { type: Date, default: null },
      ring: { type: String, default: '' }
    }
  },

  limits: {
    daily: {
      commands: { type: Map, of: Number, default: {} },
      spins: { type: Map, of: Number, default: {} },
      gacha: { type: Map, of: Number, default: {} },
      pvp: { type: Map, of: Number, default: {} }
    },
    global: {
      commands: { type: Number, default: 1000 },
      messages: { type: Number, default: 5000 }
    },
    cooldowns: {
      beg: { type: Number, default: 0 },
      rob: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
      work: { type: Number, default: 0 },
      fish: { type: Number, default: 0 },
      pvp: { type: Number, default: 0 },
      spin: { type: Number, default: 0 }
    }
  },

  website: {
    sessions: { type: [String], default: [] },
    lastVisit: { type: Date, default: null },
    visitedPages: { type: [String], default: [] },
    pageViews: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: true },
      autoPlay: { type: Boolean, default: false }
    },
    dailyVisits: { type: [Date], default: [] },
    spinPage: {
      lastVisit: { type: Date, default: null },
      totalVisits: { type: Number, default: 0 },
      spinsFromWeb: { type: Number, default: 0 }
    },
    petPage: {
      lastInteraction: { type: Date, default: null },
      upgradesDone: { type: Number, default: 0 },
      foodGiven: { type: Number, default: 0 }
    }
  },

  shop: {
    purchases: { type: [{
      itemId: { type: String, default: '' },
      date: { type: Date, default: Date.now },
      price: { type: Number, default: 0 }
    }], default: [] },
    cart: { type: [String], default: [] },
    wishlist: { type: [String], default: [] },
    totalSpent: { type: Number, default: 0 },
    lastPurchase: { type: Date, default: null }
  },

  leaderboard: {
    rankings: {
      level: { type: Number, default: 0 },
      wealth: { type: Number, default: 0 },
      petLevel: { type: Number, default: 0 },
      games: { type: Number, default: 0 }
    },
    points: {
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      allTime: { type: Number, default: 0 }
    },
    season: {
      current: { type: String, default: '' },
      points: { type: Number, default: 0 },
      tier: { type: String, default: 'bronze' }
    }
  },

  stats: {
    messagesSent: { type: Number, default: 0 },
    commandsUsed: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    totalOnlineTime: { type: Number, default: 0 },
    referrals: { type: Number, default: 0 },
    referralCode: { 
      type: String, 
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase() 
    },
    warnings: { type: Number, default: 0 },
    mutes: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    friendRequests: { type: Number, default: 0 }
  },

  logs: {
    lastLogin: { type: Date, default: null },
    lastLogout: { type: Date, default: null },
    registrationIp: { type: String, default: '' },
    loginHistory: { type: [{
      ip: { type: String, default: '' },
      device: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }], default: [] },
    actionLogs: { type: [{
      action: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
      details: { type: String, default: '' }
    }], default: [] },
    economyLogs: { type: [{
      type: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      timestamp: { type: Date, default: Date.now },
      description: { type: String, default: '' }
    }], default: [] }
  },

  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastClaim: { type: Number, default: 0 },
    lastBeg: { type: Number, default: 0 },
    lastRob: { type: Number, default: 0 },
    lastDaily: { type: Number, default: 0 },
    lastWork: { type: Number, default: 0 },
    lastSpin: { type: Number, default: 0 },
    lastPetFeed: { type: Date, default: null },
    lastPetPlay: { type: Date, default: null }
  },

  metadata: {
    version: { type: Number, default: 2 },
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    flags: { type: [String], default: [] },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] }
  }
}, {
  timestamps: true,
  _id: false
});

const User = mongoose.model('User', UserSchema);
export default User;
