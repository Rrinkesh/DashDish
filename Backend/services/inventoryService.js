const inventoryModel = require('../models/inventoryModel');
const foodmodel = require('../models/foodmodel');
const { getIo } = require('../socket/socketHandler');

/**
 * Validates if there's enough stock and deducts it. Throws error if insufficient.
 * simulated atomic check to ensure safety on standalone DB instances.
 */
const checkAndDeductInventory = async (orderItems) => {
    const io = getIo();
    let pendingDeductions = [];
    let updatedIngredients = new Set();
    let lowStockAlerts = [];

    // Phase 1: Check availability
    for (const item of orderItems) {
        const food = await foodmodel.findById(item._id);
        if (!food || !food.ingredients || food.ingredients.length === 0) continue;

        for (const ingredientInfo of food.ingredients) {
            const inventoryItem = await inventoryModel.findById(ingredientInfo.inventoryId);
            if (!inventoryItem) continue;

            const totalRequired = ingredientInfo.quantityRequired * item.quantity;
            
            // Validate stock
            if (inventoryItem.quantityAvailable < totalRequired) {
                throw new Error(`Insufficient stock for ingredient: ${inventoryItem.ingredientName}`);
            }

            pendingDeductions.push({
                inventoryId: ingredientInfo.inventoryId,
                amount: totalRequired
            });
        }
    }

    // Phase 2: Deduct (Since we checked all, this is relatively safe)
    for (const deduction of pendingDeductions) {
        const inventoryItem = await inventoryModel.findById(deduction.inventoryId);
        if (inventoryItem) {
            inventoryItem.quantityAvailable -= deduction.amount;
            inventoryItem.totalConsumed = (inventoryItem.totalConsumed || 0) + deduction.amount;
            inventoryItem.lastUpdated = Date.now();
            await inventoryItem.save();

            updatedIngredients.add(inventoryItem._id.toString());

            if (inventoryItem.quantityAvailable <= inventoryItem.minimumThreshold) {
                lowStockAlerts.push(inventoryItem);
            }
        }
    }

    // Process Out of Stock auto-logic
    for (const inventoryId of updatedIngredients) {
        const inventoryItem = await inventoryModel.findById(inventoryId);
        if (inventoryItem && inventoryItem.quantityAvailable === 0) {
            const affectedFoods = await foodmodel.find({ "ingredients.inventoryId": inventoryId });
            for (const food of affectedFoods) {
                if (food.available) {
                    food.available = false;
                    await food.save();
                    try { io.to("admin").emit("food:out_of_stock", food); } catch(e) {}
                }
            }
        }
    }

    // Send Low Stock Alerts
    if (lowStockAlerts.length > 0) {
        try { io.to("admin").emit("inventory:low_stock", lowStockAlerts); } catch (e) {}
    }

    // Emit general update
    try { io.to("admin").emit("inventory:updated"); } catch(e) {}
};

/**
 * Restore inventory on order cancellation or failure
 */
const restoreInventory = async (orderItems) => {
    try {
        const io = getIo();
        let restoredIngredients = new Set();

        for (const item of orderItems) {
            const food = await foodmodel.findById(item._id);
            if (!food || !food.ingredients || food.ingredients.length === 0) continue;

            for (const ingredientInfo of food.ingredients) {
                const totalToRestore = ingredientInfo.quantityRequired * item.quantity;
                const inventoryItem = await inventoryModel.findById(ingredientInfo.inventoryId);
                
                if (inventoryItem) {
                    inventoryItem.quantityAvailable += totalToRestore;
                    inventoryItem.totalConsumed = Math.max(0, (inventoryItem.totalConsumed || 0) - totalToRestore);
                    inventoryItem.lastUpdated = Date.now();
                    await inventoryItem.save();

                    restoredIngredients.add(inventoryItem._id.toString());
                }
            }
        }

        // Restore food availability if it was 0 before
        for (const inventoryId of restoredIngredients) {
            const inventoryItem = await inventoryModel.findById(inventoryId);
            if (inventoryItem && inventoryItem.quantityAvailable > 0) {
                const affectedFoods = await foodmodel.find({ "ingredients.inventoryId": inventoryId });
                for (const food of affectedFoods) {
                    if (!food.available) {
                        food.available = true;
                        await food.save();
                    }
                }
            }
        }

        try { io.to("admin").emit("inventory:updated"); } catch(e) {}
    } catch (error) {
        console.error("Error restoring inventory:", error);
    }
};

module.exports = { checkAndDeductInventory, restoreInventory };
