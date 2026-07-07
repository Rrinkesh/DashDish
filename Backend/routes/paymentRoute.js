const express = require('express');
const { createPaymentOrder, verifyPayment, razorpayWebhook, initiateRefund } = require('../controllers/paymentController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const paymentRouter = express.Router();

paymentRouter.post('/create-order', authmiddleware, createPaymentOrder);
paymentRouter.post('/verify', authmiddleware, verifyPayment);
paymentRouter.post('/webhook', razorpayWebhook);

// Owner route for refunds
paymentRouter.post('/refund', authmiddleware, authorizeRoles('OWNER'), initiateRefund);

module.exports = paymentRouter;
