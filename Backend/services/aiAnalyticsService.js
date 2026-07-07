const { GoogleGenerativeAI } = require("@google/generative-ai");
const ordermodel = require('../models/ordermodel');
const inventoryModel = require('../models/inventoryModel');
const wasteModel = require('../models/wasteModel');

const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(apiKey);

// Helper to fetch and aggregate data
const getBusinessContext = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // 1. Fetch Orders
    const recentOrders = await ordermodel.find({ date: { $gte: sevenDaysAgo } });
    
    let totalRevenue = 0;
    const itemSales = {};
    let totalOrders = recentOrders.length;
    let paymentMethods = { Stripe: 0, COD: 0, PayAtRestaurant: 0 };
    
    recentOrders.forEach(order => {
        if (order.status === 'Completed' || order.payment === true || order.status === 'Ready') {
            totalRevenue += order.amount;
        }
        if (order.paymentMethod) {
            paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
        }
        order.items.forEach(item => {
            itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
        });
    });

    const sortedItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
    const bestSellers = sortedItems.slice(0, 3).map(i => `${i[0]} (${i[1]} sold)`);
    const worstSellers = sortedItems.slice(-3).map(i => `${i[0]} (${i[1]} sold)`);

    // 2. Fetch Inventory & Waste
    const inventory = await inventoryModel.find({});
    const lowStock = inventory.filter(i => i.quantityAvailable <= i.minimumThreshold).map(i => i.ingredientName);
    const outOfStock = inventory.filter(i => i.quantityAvailable === 0).map(i => i.ingredientName);
    
    const recentWaste = await wasteModel.find({ dateLogged: { $gte: sevenDaysAgo } });
    let totalWasteCost = 0;
    recentWaste.forEach(w => totalWasteCost += w.costLost);

    return {
        totalRevenue,
        totalOrders,
        bestSellers,
        worstSellers,
        lowStock,
        outOfStock,
        totalWasteCost,
        paymentMethods
    };
};

const generateBusinessInsight = async (userPrompt, chatHistory = []) => {
    try {
        const metrics = await getBusinessContext();
        
        const systemInstruction = `
You are DashDish AI Analytics, a Senior Restaurant Consultant.
Your job is to answer the restaurant owner's questions using ONLY the data provided below.
Do not invent data. If you don't know, say so. Keep answers professional, concise, and structured.

RESTAURANT DATA (Last 7 Days):
- Total Revenue: ₹${metrics.totalRevenue}
- Total Orders: ${metrics.totalOrders}
- Best Selling Items: ${metrics.bestSellers.join(", ") || "N/A"}
- Worst Selling Items: ${metrics.worstSellers.join(", ") || "N/A"}
- Payment Methods Used: ${JSON.stringify(metrics.paymentMethods)}

INVENTORY ALERTS:
- Low Stock Ingredients: ${metrics.lowStock.join(", ") || "None"}
- Out of Stock Ingredients: ${metrics.outOfStock.join(", ") || "None"}
- Total Waste Cost: ₹${metrics.totalWasteCost}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemInstruction }] },
                { role: "model", parts: [{ text: "Understood. I will act as the Senior Restaurant Consultant and analyze the provided data." }] },
                ...formattedHistory
            ],
            generationConfig: { temperature: 0.3 }
        });

        const result = await chat.sendMessage(userPrompt);
        return result.response.text();
    } catch (error) {
        if (apiKey === "YOUR_API_KEY_HERE" || !process.env.GEMINI_API_KEY) {
            return "I'm currently running in offline demo mode since no GEMINI_API_KEY was provided in your environment variables. In production, I would use advanced AI to analyze your sales and provide actionable business insights.";
        }
        console.error("AI Analytics Error:", error);
        throw new Error("Failed to generate AI analytics response.");
    }
};

const generateForecast = async () => {
    try {
        const metrics = await getBusinessContext();
        const prompt = `Based on the following data from the last 7 days:
Revenue: ₹${metrics.totalRevenue}, Orders: ${metrics.totalOrders}, Best Sellers: ${metrics.bestSellers.join(", ")}.
Please provide a brief 3-point forecast for tomorrow:
1. Demand Forecast (High/Med/Low & why)
2. Items to prep in advance (based on best sellers)
3. One menu optimization suggestion (e.g. promoting a worst seller or removing it).
Keep it under 4 sentences total.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        if (apiKey === "YOUR_API_KEY_HERE" || !process.env.GEMINI_API_KEY) {
            return "1. Demand Forecast: Moderate based on average weekday trends.\n2. Prep items: Focus on best sellers listed above.\n3. Optimization: Consider running a promotion on slow-moving inventory to reduce waste.\n(Note: Generated via offline mock mode due to missing API key).";
        }
        console.error("Forecast Error:", error);
        return "Unable to generate forecast at this time. Please check your API key or try again later.";
    }
};

module.exports = { getBusinessContext, generateBusinessInsight, generateForecast };
