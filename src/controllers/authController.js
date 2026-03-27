const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
    const { username, email, password, fullName } = req.body;
    
    try {
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, fullName]
        );
        
        // Generate token
        const token = jwt.sign(
            { id: result.insertId, username, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                username,
                email,
                fullName,
                profilePicture: 'https://via.placeholder.com/150'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, password_hash, full_name, profile_picture FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                profilePicture: user.profile_picture
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const refreshToken = async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ message: 'Refresh token required' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        
        const newToken = jwt.sign(
            { id: decoded.id, username: decoded.username, email: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.json({ token: newToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

const logout = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

module.exports = {
    register,
    login,
    refreshToken,
    logout
};