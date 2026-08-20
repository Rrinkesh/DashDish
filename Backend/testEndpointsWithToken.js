const axios = require('axios');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNGRhNGZlZDg5NDI5ZjliNWU4NzdjMiIsImlhdCI6MTc4NzE5NDg1OX0.a2v_bdHA3NXGkAtDBF5krLBPEs8rsDPO9PsBft6tF3w";
const url = "http://localhost:4000";

async function test() {
    console.log("Testing POST /api/user/profile...");
    try {
        const res = await axios.post(`${url}/api/user/profile`, {}, { headers: { token } });
        console.log("Profile Success:", res.data.success);
        console.log("Profile Data:", JSON.stringify(res.data.data, null, 2));
    } catch (err) {
        console.error("Profile Fetch Error:", err.response ? { status: err.response.status, data: err.response.data } : err.message);
    }

    console.log("\nTesting POST /api/order/userorders...");
    try {
        const res = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } });
        console.log("Orders Success:", res.data.success);
        console.log("Orders Count:", res.data.data ? res.data.data.length : 0);
    } catch (err) {
        console.error("Orders Fetch Error:", err.response ? { status: err.response.status, data: err.response.data } : err.message);
    }
}

test();
