const inventoryModel = require('../models/inventoryModel');
const wasteModel = require('../models/wasteModel');
const ordermodel = require('../models/ordermodel');
const foodmodel = require('../models/foodmodel');

// Get Operations Dashboard Metrics
const getDashboardMetrics = async (req, res) => {
    try {
        const inventory = await inventoryModel.find({});
        const waste = await wasteModel.find({});
        
        let totalInventoryValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        
        inventory.forEach(item => {
            totalInventoryValue += (item.quantityAvailable * item.pricePerUnit);
            if (item.quantityAvailable === 0) {
                outOfStockCount++;
            } else if (item.quantityAvailable <= item.minimumThreshold) {
                lowStockCount++;
            }
        });

        // Waste cost
        let totalWasteCost = 0;
        waste.forEach(w => totalWasteCost += w.costLost);

        res.json({
            success: true,
            data: {
                totalInventoryValue,
                lowStockCount,
                outOfStockCount,
                totalWasteCost,
                inventoryCount: inventory.length
            }
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching metrics" });
    }
};

// Kitchen Insights
const getKitchenInsights = async (req, res) => {
    try {
        // Most used ingredients
        const mostUsed = await inventoryModel.find({}).sort({ totalConsumed: -1 }).limit(5);

        // Bottlenecks (Orders stuck in Preparing)
        const preparingOrders = await ordermodel.find({ status: 'Preparing' });
        
        // Simple peak load calculation (Orders grouped by hour, naive approach for now)
        const recentOrders = await ordermodel.find({ date: { $gte: new Date(Date.now() - 24*60*60*1000) } });
        let hours = Array(24).fill(0);
        recentOrders.forEach(order => {
            const hour = new Date(order.date).getHours();
            hours[hour]++;
        });

        res.json({
            success: true,
            data: {
                mostUsedIngredients: mostUsed,
                bottleneckCount: preparingOrders.length,
                peakLoadLast24h: hours
            }
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching insights" });
    }
};

// Menu Optimization
const getMenuOptimization = async (req, res) => {
    try {
        const inventory = await inventoryModel.find({});
        const highStockIds = inventory.filter(i => i.quantityAvailable > i.minimumThreshold * 3).map(i => i._id.toString());
        const lowStockIds = inventory.filter(i => i.quantityAvailable > 0 && i.quantityAvailable <= i.minimumThreshold).map(i => i._id.toString());
        
        const allFoods = await foodmodel.find({});
        
        let promoteList = [];
        let hideList = [];

        allFoods.forEach(food => {
            if (!food.ingredients) return;
            
            let isLow = false;
            let isHigh = false;

            food.ingredients.forEach(ing => {
                if (lowStockIds.includes(ing.inventoryId.toString())) isLow = true;
                if (highStockIds.includes(ing.inventoryId.toString())) isHigh = true;
            });

            if (isLow) hideList.push(food);
            else if (isHigh) promoteList.push(food);
        });

        res.json({
            success: true,
            data: {
                promote: promoteList.slice(0, 5),
                hide: hideList.slice(0, 5)
            }
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error generating optimization" });
    }
};

// Waste Tracking API
const logWaste = async (req, res) => {
    try {
        const { inventoryId, quantityWasted, reason } = req.body;
        const inventoryItem = await inventoryModel.findById(inventoryId);
        
        if (!inventoryItem) return res.json({ success: false, message: "Inventory item not found" });

        const costLost = quantityWasted * inventoryItem.pricePerUnit;

        const newWaste = new wasteModel({
            inventoryId,
            ingredientName: inventoryItem.ingredientName,
            quantityWasted,
            unit: inventoryItem.unit,
            reason,
            costLost
        });

        await newWaste.save();

        // Deduct from inventory
        inventoryItem.quantityAvailable -= quantityWasted;
        if (inventoryItem.quantityAvailable < 0) inventoryItem.quantityAvailable = 0;
        await inventoryItem.save();

        // Socket emit
        try {
            const { getIo } = require('../socket/socketHandler');
            getIo().to("admin").emit("inventory:updated");
            getIo().to("admin").emit("waste:logged", newWaste);
        } catch(e) {}

        res.json({ success: true, message: "Waste logged successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error logging waste" });
    }
};

const getWasteHistory = async (req, res) => {
    try {
        const history = await wasteModel.find({}).sort({ dateLogged: -1 }).limit(20);
        res.json({ success: true, data: history });
    } catch (error) {
        res.json({ success: false, message: "Error fetching waste history" });
    }
}

module.exports = { getDashboardMetrics, getKitchenInsights, getMenuOptimization, logWaste, getWasteHistory };
