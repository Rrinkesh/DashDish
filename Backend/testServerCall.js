const axios = require('axios');

async function testServer() {
    console.log("--- TESTING http://localhost:4000/api/ai/chat ---");
    try {
        const res = await axios.post("http://localhost:4000/api/ai/chat", {
            message: "What food items do you have?",
            history: []
        });
        console.log("Customer AI Response Status:", res.status);
        console.log("Customer AI Response Data:", JSON.stringify(res.data, null, 2));
    } catch(err) {
        console.error("Customer AI Error:", err.response ? { status: err.response.status, data: err.response.data } : err.message);
    }

    console.log("\n--- TESTING http://localhost:4000/api/analytics/chat ---");
    try {
        const res = await axios.post("http://localhost:4000/api/analytics/chat", {
            message: "What is my revenue?",
            history: []
        });
        console.log("Admin AI Response Status:", res.status);
        console.log("Admin AI Response Data:", JSON.stringify(res.data, null, 2));
    } catch(err) {
        console.error("Admin AI Error:", err.response ? { status: err.response.status, data: err.response.data } : err.message);
    }
}

testServer();
