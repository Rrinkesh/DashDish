const express = require('express');
const { createCoupon, getCoupons, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const couponRouter = express.Router();

// Owner routes
couponRouter.post('/create', authmiddleware, authorizeRoles('OWNER'), createCoupon);
couponRouter.get('/list', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), getCoupons);
couponRouter.delete('/:id', authmiddleware, authorizeRoles('OWNER'), deleteCoupon);

// Customer route
couponRouter.post('/validate', authmiddleware, validateCoupon);

module.exports = couponRouter;
