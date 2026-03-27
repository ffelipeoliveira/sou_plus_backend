const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { authLimiter, messageLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageLimiter, messageRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Duplicate entry' });
    }
    
    if (err.code === 'ER_NO_REFERENCED_ROW') {
        return res.status(404).json({ message: 'Referenced record not found' });
    }
    
    res.status(500).json({ message: 'Something went wrong!' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;