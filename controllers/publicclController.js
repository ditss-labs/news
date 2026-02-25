import User from '../models/User.js';

export const getPublicProfile = async (req, res) => {
    try {
        const { nickname } = req.params;
        
        // Cari user berdasarkan nickname (case-insensitive)
        const user = await User.findOne({ 
            'profile.nickname': { $regex: new RegExp(`^${nickname}$`, 'i') }
        }).select('-profile.password -logs -__v -metadata'); // Jangan kirim data sensitif
        
        if (!user) {
            // Coba cari berdasarkan name jika nickname tidak ditemukan
            const userByName = await User.findOne({ 
                'profile.name': { $regex: new RegExp(`^${nickname}$`, 'i') }
            }).select('-profile.password -logs -__v -metadata');
            
            if (!userByName) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Kirim data user berdasarkan name
            return res.json({
                success: true,
                profile: {
                    jid: userByName._id,
                    phone: userByName._id.split('@')[0],
                    name: userByName.profile.name,
                    nickname: userByName.profile.nickname || userByName.profile.name,
                    bio: userByName.profile.bio,
                    avatar: userByName.profile.avatar,
                    level: userByName.account.level,
                    title: userByName.account.title,
                    registered: userByName.account.registered,
                    social: {
                        guild: userByName.social?.guild?.name,
                        reputation: userByName.social?.reputation?.points
                    }
                }
            });
        }
        
        // Kirim data user berdasarkan nickname
        res.json({
            success: true,
            profile: {
                jid: user._id,
                phone: user._id.split('@')[0],
                name: user.profile.name,
                nickname: user.profile.nickname,
                bio: user.profile.bio,
                avatar: user.profile.avatar,
                level: user.account.level,
                title: user.account.title,
                registered: user.account.registered,
                social: {
                    guild: user.social?.guild?.name,
                    reputation: user.social?.reputation?.points
                }
            }
        });
        
    } catch (error) {
        console.error('Public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
