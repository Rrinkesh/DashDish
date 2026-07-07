const express = require('express');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { placeorder, verifyorder, userorders, listorders, updatestatus, rateDriver } = require('../controllers/ordercontroller');

const orderrouter = express.Router();

// Customer actions
orderrouter.post("/place", authmiddleware, placeorder);
orderrouter.post("/verify", verifyorder);
orderrouter.post("/userorders", authmiddleware, userorders);
orderrouter.post("/rate-driver", authmiddleware, rateDriver);

// Admin actions - Protected
orderrouter.get("/list", authmiddleware, authorizeRoles('OWNER', 'MANAGER', 'KITCHEN', 'DELIVERY'), listorders);
orderrouter.post("/status", authmiddleware, authorizeRoles('OWNER', 'MANAGER', 'KITCHEN', 'DELIVERY'), updatestatus);

module.exports = orderrouter;
