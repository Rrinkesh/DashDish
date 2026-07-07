const express = require('express');
const { addTable, getTables, updateTableStatus, removeTable, getTableDetails } = require('../controllers/tableController');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const tableRoute = express.Router();

tableRoute.post('/add', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), addTable);
tableRoute.get('/list', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), getTables);
tableRoute.post('/status', authmiddleware, authorizeRoles('OWNER', 'MANAGER', 'KITCHEN'), updateTableStatus);
tableRoute.post('/remove', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), removeTable);

// Public route for customer scanning QR code
tableRoute.get('/details/:id', getTableDetails);

module.exports = tableRoute;
