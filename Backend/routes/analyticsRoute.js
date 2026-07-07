const express = require('express');
const { getDashboardSummary, getForecast, chatWithAnalytics } = require('../controllers/analyticsController');
const rateLimit = require('express-rate-limit');

const analyticsRouter = express.Router();

const aiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 20,
    message: { success: false, message: "Too many requests. Please wait." }
});

analyticsRouter.get('/summary', getDashboardSummary);
analyticsRouter.get('/forecast', getForecast);
analyticsRouter.post('/chat', aiLimiter, chatWithAnalytics);

module.exports = analyticsRouter;
