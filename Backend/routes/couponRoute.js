const express = require('express');
const { createCoupon, getCoupons, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const couponRouter = express.Router();

// Admin/owner routes
couponRouter.post('/create', authmiddleware, authorizeRoles('OWNER', 'MANAGER', 'SUPER_ADMIN', 'admin'), createCoupon);
couponRouter.get('/list', authmiddleware, authorizeRoles('OWNER', 'MANAGER', 'SUPER_ADMIN', 'admin'), getCoupons);
couponRouter.delete('/:id', authmiddleware, authorizeRoles('OWNER', 'MANAGER', 'SUPER_ADMIN', 'admin'), deleteCoupon);

// Customer route
couponRouter.post('/validate', authmiddleware, validateCoupon);

module.exports = couponRouter;
