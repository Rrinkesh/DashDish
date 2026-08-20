const express = require('express');
const { updateAvailability, assignDriver, verifyOTP, completeDelivery, getAvailableDrivers, rejectDelivery, acceptDelivery, getAvailability } = require('../controllers/deliveryController');
const { addPartner, getPartners, editPartner, togglePartnerStatus } = require('../controllers/deliveryPartnerController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const deliveryRoute = express.Router();

// Driver routes
deliveryRoute.post('/status', authmiddleware, authorizeRoles('DELIVERY'), updateAvailability);
deliveryRoute.get('/status', authmiddleware, authorizeRoles('DELIVERY'), getAvailability);
deliveryRoute.post('/verify-otp', authmiddleware, authorizeRoles('DELIVERY'), verifyOTP);
deliveryRoute.post('/complete', authmiddleware, authorizeRoles('DELIVERY'), completeDelivery);
deliveryRoute.post('/accept', authmiddleware, authorizeRoles('DELIVERY'), acceptDelivery);
deliveryRoute.post('/reject', authmiddleware, authorizeRoles('DELIVERY'), rejectDelivery);

// Manager/Owner routes for Orders
deliveryRoute.get('/available', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), getAvailableDrivers);
deliveryRoute.post('/assign', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), assignDriver);

// Manager/Owner routes for Partners Management
deliveryRoute.get('/partners', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), getPartners);
deliveryRoute.post('/partners/add', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), addPartner);
deliveryRoute.post('/partners/edit', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), editPartner);
deliveryRoute.post('/partners/toggle', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), togglePartnerStatus);

module.exports = deliveryRoute;
