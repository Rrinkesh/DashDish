const mongoose = require('mongoose');
const usermodel = require('./models/usermodel');

mongoose.connect('mongodb://127.0.0.1:27017/food_del').then(async () => {
    const admins = await usermodel.find({ role: { $ne: 'CUSTOMER' } }).select('email role name');
    console.log("STAFF ACCOUNTS FOUND:", admins);
    process.exit(0);
});
