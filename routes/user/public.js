import User from '../../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app) => {
    
    // Halaman profile publik
    app.get('/u/:nickname', (req, res) => {
        res.sendFile(path.join(__dirname, '../../views', 'profile.html'));
    });
    
    // API profile publik
    app.get('/u/api/:nickname', async (req, res) => {
        try {
            const { nickname } = req.params;
            
            const user = await User.findOne({ 
                $or: [
                    { 'profile.nickname': { $regex: new RegExp(`^${nickname}$`, 'i') } },
                    { 'profile.name': { $regex: new RegExp(`^${nickname}$`, 'i') } }
                ]
            }).select('-profile.password -logs -__v');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.json({
                success: true,
                profile: {
                    name: user.profile.name,
                    nickname: user.profile.nickname || user.profile.name,
                    bio: user.profile.bio,
                    avatar: user.profile.avatar,
                    level: user.account.level,
                    title: user.account.title
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
    
};
