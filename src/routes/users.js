const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
    searchUsers
} = require('../controllers/userController');

router.get('/me', authenticateToken, getCurrentUser);
router.put('/me', authenticateToken, updateProfile);
router.put('/me/password', authenticateToken, changePassword);
router.delete('/me', authenticateToken, deleteAccount);
router.get('/search', authenticateToken, searchUsers);

module.exports = router;