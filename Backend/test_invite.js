const axios = require('axios');

async function testInvite() {
    try {
        const response = await axios.post('http://localhost:4000/api/admin/staff/invite', {
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '1234567890',
            role: 'MANAGER',
            temporaryPassword: 'password123'
        }, {
            headers: {
                token: 'admin_token_placeholder'
            }
        });
        console.log(response.data);
    } catch (e) {
        console.log(e.response ? e.response.data : e.message);
    }
}

testInvite();
