const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    sendMessage,
    getConversation,
    getConversations,
    markAsRead,
    deleteMessage
} = require('../controllers/messageController');

router.post('/', authenticateToken, sendMessage);
router.get('/conversations', authenticateToken, getConversations);
router.get('/conversation/:userId', authenticateToken, getConversation);
router.put('/:messageId/read', authenticateToken, markAsRead);
router.delete('/:messageId', authenticateToken, deleteMessage);

module.exports = router;