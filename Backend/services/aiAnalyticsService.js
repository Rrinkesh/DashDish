const { GoogleGenerativeAI } = require("@google/generative-ai");
const ordermodel = require('../models/ordermodel');
const inventoryModel = require('../models/inventoryModel');
const wasteModel = require('../models/wasteModel');


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

const formatHistoryForGemini = (chatHistory) => {
    const history = [];
    if (!Array.isArray(chatHistory)) return history;

    for (const msg of chatHistory) {
        const textContent = (msg.fullText || msg.text || "").trim();
        if (!textContent) continue;

        const role = msg.sender === 'user' ? 'user' : 'model';

        if (history.length === 0) {
            if (role === 'user') {
                history.push({ role: 'user', parts: [{ text: textContent }] });
            }
        } else {
            const lastRole = history[history.length - 1].role;
            if (role !== lastRole) {
                history.push({ role, parts: [{ text: textContent }] });
            } else {
                history[history.length - 1].parts[0].text += "\n" + textContent;
            }
        }
    }

    // startChat history must end with a 'model' role so sendMessage(userPrompt) appends a 'user' turn cleanly
    if (history.length > 0 && history[history.length - 1].role === 'user') {
        history.pop();
    }

    return history;
};

// Retry helper with exponential backoff for Gemini overload (503) errors
const withRetry = async (fn, retries = 3, delayMs = 1500) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isOverloaded =
                err?.message?.toLowerCase().includes("overloaded") ||
                err?.message?.toLowerCase().includes("503") ||
                err?.status === 503;

            if (isOverloaded && attempt < retries) {
                console.warn(`Gemini overloaded, retrying in ${delayMs * attempt}ms (attempt ${attempt}/${retries})...`);
                await new Promise(r => setTimeout(r, delayMs * attempt));
            } else {
                throw err;
            }
        }
    }
};

const generateBusinessInsight = async (userPrompt, chatHistory = []) => {
    try {
        const key = process.env.GEMINI_API_KEY || process.env.Gemini_Key || "YOUR_API_KEY_HERE";
        const genAI = new GoogleGenerativeAI(key);
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

        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const formattedHistory = formatHistoryForGemini(chatHistory);

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemInstruction }] },
                { role: "model", parts: [{ text: "Understood. I will act as the Senior Restaurant Consultant and analyze the provided data." }] },
                ...formattedHistory
            ],
            generationConfig: { temperature: 0.3 }
        });

        const result = await withRetry(() => chat.sendMessage(userPrompt));
        return result.response.text();
    } catch (error) {
        console.error("AI Analytics Error:", error?.message || error);
        if (error?.message?.toLowerCase().includes("overloaded") || error?.status === 503) {
            return "The AI is experiencing high traffic right now. Please try again in a few seconds!";
        }
        const key = process.env.GEMINI_API_KEY || process.env.Gemini_Key;
        if (!key || key === "YOUR_API_KEY_HERE") {
            return "I'm currently running in offline demo mode since no GEMINI_API_KEY was provided in your environment variables.";
        }
        return "I'm having trouble generating a response right now. Please try again.";
    }
};

const generateForecast = async () => {
    try {
        const key = process.env.GEMINI_API_KEY || process.env.Gemini_Key || "YOUR_API_KEY_HERE";
        if (!key || key === "YOUR_API_KEY_HERE") {
            return "1. Demand Forecast: Moderate based on average weekday trends.\n2. Prep items: Focus on best sellers listed above.\n3. Optimization: Consider running a promotion on slow-moving inventory to reduce waste.\n(Note: Generated via offline mock mode due to missing API key).";
        }
        const genAI = new GoogleGenerativeAI(key);
        const metrics = await getBusinessContext();
        const prompt = `Based on the following data from the last 7 days:
Revenue: ₹${metrics.totalRevenue}, Orders: ${metrics.totalOrders}, Best Sellers: ${metrics.bestSellers.join(", ")}.
Please provide a brief 3-point forecast for tomorrow:
1. Demand Forecast (High/Med/Low & why)
2. Items to prep in advance (based on best sellers)
3. One menu optimization suggestion (e.g. promoting a worst seller or removing it).
Keep it under 4 sentences total.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const result = await withRetry(() => model.generateContent(prompt));
        return result.response.text();
    } catch (error) {
        console.error("Forecast Error:", error?.message || error);
        if (error?.message?.toLowerCase().includes("overloaded") || error?.status === 503) {
            return "The AI forecast service is experiencing high traffic. Please refresh the page in a few seconds.";
        }
        return "Unable to generate forecast at this time. Please try again later.";
    }
};

module.exports = { getBusinessContext, generateBusinessInsight, generateForecast };
