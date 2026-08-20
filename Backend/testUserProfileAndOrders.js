const { connectdb } = require('./config/db');
const usermodel = require('./models/usermodel');
const ordermodel = require('./models/ordermodel');

process.env.MONGO = "mongodb+srv://rinkeshbhatiset0_db_user:hMPPFEVpe3Nu0Afr@cluster0.zh2bttl.mongodb.net/?appName=Cluster0";

async function run() {
    await connectdb();
    
    // Find first user
    const user = await usermodel.findOne({});
    console.log("TEST USER:", user ? { _id: user._id, email: user.email, name: user.name } : "None");
    
    if (user) {
        // Fetch user profile logic
        const profile = await usermodel.findById(user._id).select('-password');
        console.log("PROFILE RESULT:", profile ? "SUCCESS" : "FAILED");
        
        // Fetch user orders logic
        const orders = await ordermodel.find({ userid: user._id.toString() });
        console.log("ORDERS RESULT COUNT:", orders.length);
    }
    process.exit(0);
}

run();
