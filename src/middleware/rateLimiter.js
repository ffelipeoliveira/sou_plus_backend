const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const getIP = (req) => {
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    if (cfConnectingIP) return cfConnectingIP;
    
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return ipKeyGenerator(req);
};


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIP
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true, 
    message: { message: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIP
});

const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30, 
    message: { message: 'Too many messages sent. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getIP
});


const apiKeyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    keyGenerator: (req) => {
        const apiKey = req.headers['x-api-key'];
        return apiKey || getIP(req);
    },
    message: { message: 'API rate limit exceeded.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    authLimiter,
    messageLimiter,
    apiKeyLimiter,
    getIP
};