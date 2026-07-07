const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the API with the key
const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(apiKey);

const generateChatResponse = async (userPrompt, menuContext, chatHistory = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const systemInstruction = `
You are DashDish AI, a helpful, enthusiastic customer assistant for a food delivery restaurant.
Your primary role is to help customers choose food, recommend items, and build budget-friendly orders.

CRITICAL RULES:
1. ONLY recommend items that are explicitly listed in the LIVE MENU DATA below.
2. DO NOT hallucinate, invent, or suggest any food items not in the live menu.
3. Keep responses concise, friendly, and well-formatted (use bullet points for lists).
4. If a user has a budget, calculate the total price of your recommendations to ensure they fit within the budget.
5. If the user asks for something not on the menu, politely inform them that it's unavailable and suggest the closest alternative from the menu.

LIVE MENU DATA:
${menuContext}
`;

        // Format history for Gemini
        // Gemini expects history in format: { role: 'user' | 'model', parts: [{text: string}] }
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemInstruction }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am DashDish AI and I will strictly follow these instructions and use only the provided menu data." }]
                },
                ...formattedHistory
            ],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.5, // slightly low temperature to reduce hallucination
            },
        });

        const result = await chat.sendMessage(userPrompt);
        const responseText = result.response.text();
        
        return responseText;

    } catch (error) {
        if (apiKey === "YOUR_API_KEY_HERE" || !process.env.GEMINI_API_KEY) {
             return "I'm currently running in offline demo mode since no GEMINI_API_KEY was provided! In a production environment, I would analyze the live menu and recommend the best dishes for you based on your preferences.";
        }
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate AI response.");
    }
};

module.exports = { generateChatResponse };
