const { getPersonalizedRecommendations, getFrequentlyBoughtTogether } = require('../services/recommendationService');
const behaviorModel = require('../models/behaviorModel');

// Get home page personalized recommendations
const getPersonalized = async (req, res) => {
    try {
        const userId = req.body.userid; // Note: authmiddleware usually puts it in req.body.userid
        const recommendations = await getPersonalizedRecommendations(userId);
        res.json({ success: true, ...recommendations });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching recommendations" });
    }
};

// Get frequently bought together for cart/checkout
const getCartSuggestions = async (req, res) => {
    try {
        const { cartFoodIds } = req.body;
        const suggestions = await getFrequentlyBoughtTogether(cartFoodIds);
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching suggestions" });
    }
};

// Log user behavior
const logBehavior = async (req, res) => {
    try {
        const userId = req.body.userid; // from authmiddleware
        const { action, foodId, metadata } = req.body;

        if (!action) return res.json({ success: false, message: "Action is required" });

        const behavior = new behaviorModel({
            userId,
            action,
            foodId,
            metadata
        });

        await behavior.save();
        res.json({ success: true, message: "Behavior logged" });
    } catch (error) {
        // Silently fail for the client, just log to server
        console.error("Error logging behavior", error);
        res.json({ success: false, message: "Error" });
    }
};

module.exports = { getPersonalized, getCartSuggestions, logBehavior };
