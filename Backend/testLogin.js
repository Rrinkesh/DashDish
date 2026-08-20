const { connectdb } = require('./config/db');
const usermodel = require('./models/usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = "random#secret";
process.env.ADMIN_EMAIL = "admin@dashdish.com";
process.env.ADMIN_PASSWORD = "adminpassword";
process.env.MONGO = "mongodb+srv://rinkeshbhatiset0_db_user:hMPPFEVpe3Nu0Afr@cluster0.zh2bttl.mongodb.net/?appName=Cluster0";

async function run() {
    await connectdb();
    const email = "admin@dashdish.com";
    const password = "adminpassword";

    console.log("Looking up admin user...");
    let user = await usermodel.findOne({ email });
    console.log("User found:", user ? { email: user.email, role: user.role, isVerified: user.isVerified } : "None");

    if (!user) {
        console.log("Creating admin user...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await usermodel.create({
            name: 'Admin',
            email,
            password: hashedPassword,
            phone: '0000000000',
            isVerified: true,
            role: 'SUPER_ADMIN'
        });
        console.log("Admin user created.");
    }

    try {
        console.log("Comparing password...");
        const ismatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", ismatch);

        console.log("Creating token...");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log("Token generated:", token);
    } catch(err) {
        console.error("CRITICAL RUNTIME ERROR:", err);
    }
    process.exit(0);
}

run();
