const { getBusinessContext, generateBusinessInsight, generateForecast } = require('../services/aiAnalyticsService');

const getDashboardSummary = async (req, res) => {
    try {
        const metrics = await getBusinessContext();
        res.json({ success: true, data: metrics });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching dashboard summary" });
    }
};

const getForecast = async (req, res) => {
    try {
        const forecast = await generateForecast();
        res.json({ success: true, data: forecast });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching forecast" });
    }
};

const chatWithAnalytics = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.json({ success: false, message: "Message is required" });

        const responseText = await generateBusinessInsight(message, history || []);
        res.json({ success: true, text: responseText });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error chatting with AI" });
    }
};

module.exports = { getDashboardSummary, getForecast, chatWithAnalytics };
