require('dotenv').config();
const { connectdb } = require('./config/db');
const { generateChatResponse } = require('./services/aiService');
const { generateForecast, generateBusinessInsight } = require('./services/aiAnalyticsService');
const mongoose = require('mongoose');

async function testAI() {
    await connectdb();
    
    console.log("--- TESTING AI CHAT ASSISTANT ---");
    try {
        const res = await generateChatResponse("Recommend me something good", "AVAILABLE MENU ITEMS:\n- Greek Salad (Category: Salad, Price: 12)", []);
        console.log("Chat Response:", res);
    } catch(err) {
        console.error("Chat Error:", err);
    }

    console.log("\n--- TESTING AI FORECAST ---");
    try {
        const forecast = await generateForecast();
        console.log("Forecast Response:", forecast);
    } catch(err) {
        console.error("Forecast Error:", err);
    }
    
    mongoose.connection.close();
    process.exit(0);
}

testAI();
