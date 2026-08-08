const express = require('express');
const { getPersonalized, getCartSuggestions, logBehavior } = require('../controllers/recommendationController');
const { authmiddleware } = require('../middleware/auth'); // assuming it exists

const recommendationRouter = express.Router();

// Optional auth for personalization
recommendationRouter.get('/', (req, res, next) => {
    // If token exists, pass through auth, else continue
    if (req.headers.token) {
        return authmiddleware(req, res, next);
    }
    next();
}, getPersonalized);

recommendationRouter.post('/cart-suggestions', getCartSuggestions);

recommendationRouter.post('/behavior', (req, res, next) => {
    if (req.headers.token) {
        return authmiddleware(req, res, next);
    }
    next();
}, logBehavior);

module.exports = recommendationRouter;
