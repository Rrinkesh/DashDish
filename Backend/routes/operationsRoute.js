const express = require('express');
const { getDashboardMetrics, getKitchenInsights, getMenuOptimization, logWaste, getWasteHistory } = require('../controllers/operationsController');

const operationsRouter = express.Router();

operationsRouter.get('/metrics', getDashboardMetrics);
operationsRouter.get('/insights', getKitchenInsights);
operationsRouter.get('/optimization', getMenuOptimization);
operationsRouter.post('/waste/log', logWaste);
operationsRouter.get('/waste/history', getWasteHistory);

module.exports = operationsRouter;
