const { generateChatResponse } = require('../services/aiService');
const foodmodel = require('../models/foodmodel');
const fs = require('fs');

const handleChatRequest = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        // Fetch live menu context
        const availableFoods = await foodmodel.find({ available: true });
        
        if (availableFoods.length === 0) {
            return res.json({ success: true, text: "I'm sorry, but we currently have no items available on the menu!" });
        }

        // Build context string
        let menuContext = "AVAILABLE MENU ITEMS:\n";
        availableFoods.forEach(food => {
            menuContext += `- ${food.name} (Category: ${food.category}, Price: ₹${food.price})\n  Description: ${food.description}\n`;
        });

        // Basic logging
        const logEntry = `[${new Date().toISOString()}] USER: ${message}\n`;
        fs.appendFile('ai_interactions.log', logEntry, (err) => {
            if (err) console.error("Could not log AI interaction", err);
        });

        // Generate response
        const aiResponseText = await generateChatResponse(message, menuContext, history || []);

        const responseLog = `[${new Date().toISOString()}] AI: ${aiResponseText}\n\n`;
        fs.appendFile('ai_interactions.log', responseLog, () => {});

        res.json({ success: true, text: aiResponseText });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Sorry, I'm having trouble thinking right now. Please try again later!" });
    }
};

module.exports = { handleChatRequest };
