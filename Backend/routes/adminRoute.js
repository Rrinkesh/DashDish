const express = require('express');
const { 
    getStaff, inviteStaff, updateStaff, deleteStaff, 
    getRestaurantSettings, updateRestaurantSettings, createRestaurant
} = require('../controllers/adminController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const adminRouter = express.Router();

// Staff Management - Only OWNER can manage staff
adminRouter.get('/staff', authmiddleware, authorizeRoles('OWNER'), getStaff);
adminRouter.post('/staff/invite', authmiddleware, authorizeRoles('OWNER'), inviteStaff);
adminRouter.put('/staff/:id', authmiddleware, authorizeRoles('OWNER'), updateStaff);
adminRouter.delete('/staff/:id', authmiddleware, authorizeRoles('OWNER'), deleteStaff);

// Restaurant Settings
// Managers can potentially view it, but only OWNER can update. 
adminRouter.get('/restaurant', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), getRestaurantSettings);
adminRouter.put('/restaurant', authmiddleware, authorizeRoles('OWNER'), updateRestaurantSettings);

// Create Restaurant (for demo/onboarding, no auth needed right now)
adminRouter.post('/restaurant/create', createRestaurant);

module.exports = adminRouter;
