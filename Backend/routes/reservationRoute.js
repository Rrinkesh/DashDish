const express = require('express');
const { createReservation, getUserReservations, getAdminReservations, updateReservationStatus } = require('../controllers/reservationController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const reservationRoute = express.Router();

// Customer routes
reservationRoute.post('/create', authmiddleware, createReservation);
reservationRoute.post('/user-list', authmiddleware, getUserReservations);

// Admin routes
reservationRoute.post('/admin-list', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), getAdminReservations);
reservationRoute.post('/status', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), updateReservationStatus);

module.exports = reservationRoute;
