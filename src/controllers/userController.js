const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getCurrentUser = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT id, username, email, full_name as fullName, 
                    profile_picture as profilePicture, created_at as createdAt 
             FROM users WHERE id = ?`,
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    const { fullName, profilePicture, username, email } = req.body;
    const updates = [];
    const values = [];
    
    try {
        if (username) {
            const [existing] = await pool.execute(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [username, req.user.id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            updates.push('username = ?');
            values.push(username);
        }
        
        if (email) {
            const [existing] = await pool.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, req.user.id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updates.push('email = ?');
            values.push(email);
        }
        
        if (fullName) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        
        if (profilePicture) {
            updates.push('profile_picture = ?');
            values.push(profilePicture);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        values.push(req.user.id);
        await pool.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        const [users] = await pool.execute(
            `SELECT id, username, email, full_name as fullName, 
                    profile_picture as profilePicture, created_at as createdAt 
             FROM users WHERE id = ?`,
            [req.user.id]
        );
        
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
        const [users] = await pool.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );
        
        const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id]);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchUsers = async (req, res) => {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
        return res.status(400).json({ message: 'Search query required' });
    }
    
    try {
        const [users] = await pool.execute(
            `SELECT id, username, email, full_name as fullName, profile_picture as profilePicture 
             FROM users 
             WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
             LIMIT ?`,
            [`%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit)]
        );
        
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
    searchUsers
};