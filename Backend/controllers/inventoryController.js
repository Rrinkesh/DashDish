const inventoryModel = require('../models/inventoryModel');
const foodmodel = require('../models/foodmodel');

// Add a new ingredient
const addIngredient = async (req, res) => {
    try {
        const { ingredientName, quantityAvailable, unit, minimumThreshold } = req.body;
        const newIngredient = new inventoryModel({
            ingredientName,
            quantityAvailable,
            unit,
            minimumThreshold
        });
        await newIngredient.save();
        res.json({ success: true, message: "Ingredient added successfully", data: newIngredient });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error adding ingredient" });
    }
};

// Get all inventory
const getInventory = async (req, res) => {
    try {
        const inventory = await inventoryModel.find({}).sort({ lastUpdated: -1 });
        res.json({ success: true, data: inventory });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching inventory" });
    }
};

// Update stock manually
const updateStock = async (req, res) => {
    try {
        const { id, quantityAvailable, minimumThreshold, unit } = req.body;
        const inventory = await inventoryModel.findById(id);
        if (!inventory) {
            return res.json({ success: false, message: "Ingredient not found" });
        }
        
        inventory.quantityAvailable = quantityAvailable !== undefined ? quantityAvailable : inventory.quantityAvailable;
        inventory.minimumThreshold = minimumThreshold !== undefined ? minimumThreshold : inventory.minimumThreshold;
        inventory.unit = unit !== undefined ? unit : inventory.unit;
        inventory.lastUpdated = Date.now();
        
        await inventory.save();

        // If stock is manually set to 0, trigger out of stock logic
        if (inventory.quantityAvailable === 0) {
            const affectedFoods = await foodmodel.find({ "ingredients.inventoryId": inventory._id });
            for (const food of affectedFoods) {
                if (food.available) {
                    food.available = false;
                    await food.save();
                }
            }
        }

        res.json({ success: true, message: "Stock updated successfully", data: inventory });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating stock" });
    }
};

// Delete ingredient
const removeIngredient = async (req, res) => {
    try {
        await inventoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Ingredient removed" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error removing ingredient" });
    }
};

module.exports = { addIngredient, getInventory, updateStock, removeIngredient };
