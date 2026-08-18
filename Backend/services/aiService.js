const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

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

    // startChat history must end with 'model' role so sendMessage() appends a clean 'user' turn
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
                console.warn(`Gemini overloaded, retrying in ${delayMs}ms (attempt ${attempt}/${retries})...`);
                await new Promise(r => setTimeout(r, delayMs * attempt));
            } else {
                throw err;
            }
        }
    }
};

const generateChatResponse = async (userPrompt, menuContext, chatHistory = []) => {
    try {
        const key = process.env.GEMINI_API_KEY || process.env.Gemini_Key || "YOUR_API_KEY_HERE";
        if (!key || key === "YOUR_API_KEY_HERE") {
            return "I'm currently running in offline demo mode since no GEMINI_API_KEY was provided! In a production environment, I would analyze the live menu and recommend the best dishes for you based on your preferences.";
        }

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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

        const formattedHistory = formatHistoryForGemini(chatHistory);

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemInstruction }] },
                { role: "model", parts: [{ text: "Understood. I am DashDish AI and I will strictly follow these instructions and use only the provided menu data." }] },
                ...formattedHistory
            ],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.5,
            },
        });

        const result = await withRetry(() => chat.sendMessage(userPrompt));
        return result.response.text();

    } catch (error) {
        console.error("AI Generation Error:", error?.message || error);

        if (error?.message?.toLowerCase().includes("overloaded") || error?.status === 503) {
            return "I'm experiencing high traffic right now. Please try again in a few seconds! 🙏";
        }
        if (error?.message?.toLowerCase().includes("api_key") || error?.message?.toLowerCase().includes("api key")) {
            return "There's an issue with the AI configuration. Please contact support.";
        }
        return "I'm having trouble connecting right now. Please try again in a moment!";
    }
};

module.exports = { generateChatResponse };
