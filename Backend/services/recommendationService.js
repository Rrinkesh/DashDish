const ordermodel = require('../models/ordermodel');
const foodmodel = require('../models/foodmodel');
const behaviorModel = require('../models/behaviorModel');

/**
 * Get personalized recommendations for home page
 * Based on time of day, past orders, and popularity
 */
const getPersonalizedRecommendations = async (userId) => {
    let recommendations = [];
    let reason = "Trending near you";

    // 1. Time based logic
    const currentHour = new Date().getHours();
    let timeCategory = null;
    if (currentHour >= 6 && currentHour < 11) {
        timeCategory = ["Breakfast", "Deserts", "Cake"]; 
        reason = "Good Morning! Start your day right";
    } else if (currentHour >= 16 && currentHour < 19) {
        timeCategory = ["Rolls", "Sandwich", "Pure Veg"];
        reason = "Perfect evening snacks for you";
    } else if (currentHour >= 19 || currentHour < 4) {
        timeCategory = ["Noodles", "Pasta", "Salad"]; // Dinner/Late night
        reason = "Late night cravings? We got you";
    }

    // 2. Fetch past orders for this user
    let userFavorites = [];
    if (userId) {
        const pastOrders = await ordermodel.find({ userid: userId }).sort({ date: -1 }).limit(5);
        const itemFrequency = {};
        pastOrders.forEach(order => {
            order.items.forEach(item => {
                itemFrequency[item._id] = (itemFrequency[item._id] || 0) + item.quantity;
            });
        });
        
        userFavorites = Object.keys(itemFrequency)
            .sort((a, b) => itemFrequency[b] - itemFrequency[a])
            .slice(0, 3); // top 3 most ordered
    }

    // 3. Fetch foods based on criteria
    let query = { available: true };
    
    // Prioritize user favorites if they exist and it's not a strong time-based override
    if (userFavorites.length > 0 && Math.random() > 0.5) {
        query._id = { $in: userFavorites };
        reason = "Because you ordered these recently";
    } else if (timeCategory) {
        query.category = { $in: timeCategory };
    }

    recommendations = await foodmodel.find(query).limit(5);

    // If not enough, fallback to highly rated items
    if (recommendations.length < 3) {
        const fallbacks = await foodmodel.find({ available: true })
            .sort({ averageRating: -1 })
            .limit(5);
        
        // Merge without duplicates
        const existingIds = recommendations.map(r => r._id.toString());
        fallbacks.forEach(f => {
            if (!existingIds.includes(f._id.toString()) && recommendations.length < 5) {
                recommendations.push(f);
            }
        });
        if (recommendations.length > 0 && reason === "Because you ordered these recently") {
            reason = "Recommended based on your taste & trending items";
        }
    }

    return { data: recommendations, reason };
};

/**
 * Get frequently bought together items based on cart
 */
const getFrequentlyBoughtTogether = async (cartFoodIds) => {
    if (!cartFoodIds || cartFoodIds.length === 0) return [];

    try {
        // Aggregate to find orders that contain at least one item from the cart
        const orders = await ordermodel.find({
            "items._id": { $in: cartFoodIds }
        }).limit(50); // Sample last 50 relevant orders

        const coOccurrences = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const itemId = item._id.toString();
                // If it's not already in the cart, count it as a co-occurrence
                if (!cartFoodIds.includes(itemId)) {
                    coOccurrences[itemId] = (coOccurrences[itemId] || 0) + 1;
                }
            });
        });

        // Sort by highest co-occurrence
        const sortedSuggestions = Object.keys(coOccurrences)
            .sort((a, b) => coOccurrences[b] - coOccurrences[a])
            .slice(0, 4); // Top 4 suggestions

        if (sortedSuggestions.length > 0) {
            const suggestedFoods = await foodmodel.find({ _id: { $in: sortedSuggestions }, available: true });
            return suggestedFoods;
        }

        // Fallback: Return trending items from different categories than what's in cart
        return await foodmodel.find({ _id: { $nin: cartFoodIds }, available: true }).sort({ averageRating: -1 }).limit(3);

    } catch (error) {
        console.error("Error generating smart suggestions", error);
        return [];
    }
};

module.exports = { getPersonalizedRecommendations, getFrequentlyBoughtTogether };
