const express = require('express');
const { addReview, getFoodReviews } = require('../controllers/reviewController');
const { authmiddleware } = require('../middleware/auth');

const reviewRouter = express.Router();

reviewRouter.post('/add', authmiddleware, addReview);
reviewRouter.get('/:foodId', getFoodReviews);

module.exports = reviewRouter;
