const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout } = require('../controllers/authController');
const { validate, userValidation } = require('../middleware/validation');

router.post('/register', validate(userValidation.register), register);
router.post('/login', validate(userValidation.login), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;