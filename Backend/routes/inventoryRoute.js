const express = require('express');
const { addIngredient, getInventory, updateStock, removeIngredient } = require('../controllers/inventoryController');

const inventoryRouter = express.Router();

inventoryRouter.post("/add", addIngredient);
inventoryRouter.get("/list", getInventory);
inventoryRouter.post("/update", updateStock);
inventoryRouter.post("/remove", removeIngredient);

module.exports = inventoryRouter;
