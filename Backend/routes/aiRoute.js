const express = require('express');
const rateLimit = require('express-rate-limit');
const { handleChatRequest } = require('../controllers/aiController');

const aiRouter = express.Router();

// Rate limit: Max 15 requests per 10 minutes per IP
const aiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100,
    message: { success: false, message: "You are sending too many messages. Please wait a moment." },
    standardHeaders: true,
    legacyHeaders: false,
});

aiRouter.post('/chat', aiLimiter, handleChatRequest);

module.exports = aiRouter;
