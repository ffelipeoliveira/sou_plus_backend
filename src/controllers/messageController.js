const pool = require('../config/database');

const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    
    if (!receiverId || !content) {
        return res.status(400).json({ message: 'Receiver ID and content required' });
    }
    
    if (content.length > 5000) {
        return res.status(400).json({ message: 'Message too long (max 5000 characters)' });
    }
    
    try {
        const [receiver] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [receiverId]
        );
        
        if (receiver.length === 0) {
            return res.status(404).json({ message: 'Receiver not found' });
        }
        
        const [result] = await pool.execute(
            `INSERT INTO messages (sender_id, receiver_id, content) 
             VALUES (?, ?, ?)`,
            [senderId, receiverId, content]
        );
        
        const [messages] = await pool.execute(
            `SELECT m.*, 
                    u1.username as sender_username, u1.full_name as sender_name, u1.profile_picture as sender_picture,
                    u2.username as receiver_username, u2.full_name as receiver_name, u2.profile_picture as receiver_picture
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE m.id = ?`,
            [result.insertId]
        );
        
        res.status(201).json(messages[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getConversation = async (req, res) => {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const currentUserId = req.user.id;
    
    try {
        const [messages] = await pool.execute(
            `SELECT m.*, 
                    u1.username as sender_username, u1.full_name as sender_name, u1.profile_picture as sender_picture,
                    u2.username as receiver_username, u2.full_name as receiver_name, u2.profile_picture as receiver_picture
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE (sender_id = ? AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = ?)
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [currentUserId, userId, userId, currentUserId, parseInt(limit), parseInt(offset)]
        );
        
        // Mark messages as read
        await pool.execute(
            `UPDATE messages 
             SET is_read = TRUE 
             WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE`,
            [userId, currentUserId]
        );
        
        res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getConversations = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const [conversations] = await pool.execute(
            `SELECT 
                CASE 
                    WHEN m.sender_id = ? THEN m.receiver_id
                    ELSE m.sender_id
                END as user_id,
                u.username, u.full_name as fullName, u.profile_picture as profilePicture,
                MAX(m.created_at) as last_message_time,
                (SELECT content FROM messages m2 
                 WHERE (m2.sender_id = ? AND m2.receiver_id = u.id) 
                    OR (m2.sender_id = u.id AND m2.receiver_id = ?)
                 ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages m3 
                 WHERE m3.sender_id = u.id AND m3.receiver_id = ? AND m3.is_read = FALSE) as unread_count
             FROM messages m
             JOIN users u ON (u.id = m.sender_id OR u.id = m.receiver_id)
             WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?
             GROUP BY user_id, u.username, u.full_name, u.profile_picture
             ORDER BY last_message_time DESC`,
            [userId, userId, userId, userId, userId, userId, userId]
        );
        
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    try {
        const [result] = await pool.execute(
            `UPDATE messages 
             SET is_read = TRUE 
             WHERE id = ? AND receiver_id = ? AND is_read = FALSE`,
            [messageId, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found or already read' });
        }
        
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    try {
        const [result] = await pool.execute(
            'DELETE FROM messages WHERE id = ? AND sender_id = ?',
            [messageId, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found or not authorized' });
        }
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getConversations,
    markAsRead,
    deleteMessage
};