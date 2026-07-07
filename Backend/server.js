const express = require('express')
const cors = require('cors');
const http = require('http');
const { connectdb } = require('./config/db.js');
const foodrouter = require('./routes/foodroute.js');
const { userrouter } = require('./routes/userRoute.js');
const cartrouter = require('./routes/cartroute.js');
const orderrouter = require('./routes/orderroute.js');
const menurouter = require('./routes/menuRoute.js');
const reviewrouter = require('./routes/reviewRoute.js');
const recommendationRouter = require('./routes/recommendationRoute.js');
const adminRouter = require('./routes/adminRoute.js');
const tableRoute = require('./routes/tableRoute.js');
const reservationRoute = require('./routes/reservationRoute.js');
const deliveryRoute = require('./routes/deliveryRoute.js');
const couponRoute = require('./routes/couponRoute.js');
const paymentRoute = require('./routes/paymentRoute.js');
const invoiceRoute = require('./routes/invoiceRoute.js');
const inventoryRoute = require('./routes/inventoryRoute.js');
const operationsRoute = require('./routes/operationsRoute.js');
const aiRoute = require('./routes/aiRoute.js');
const recommendationRoute = require('./routes/recommendationRoute.js');
const analyticsRoute = require('./routes/analyticsRoute.js');
require("dotenv").config();

//app config
const app = express();
const port = 4000;

// HTTP Server and Socket.io setup
const server = http.createServer(app);
const { initSocket } = require('./socket/socketHandler.js');
const io = initSocket(server);

// Make io accessible in routes/controllers if needed (optional, we can export it from socketHandler too)
app.set('io', io);

//middleware...
app.use(express.json());
app.use(cors());

// database connections
connectdb();
//api endpoints...
app.use("/api/user", userrouter)
app.use("/api/food", foodrouter)
app.use("/api/menu", menurouter)
app.use("/api/cart", cartrouter);
app.use("/api/reviews", reviewrouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/table", tableRoute);
app.use("/api/reservation", reservationRoute);
app.use("/api/delivery", deliveryRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/invoice", invoiceRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/operations", operationsRoute);
app.use("/api/ai", aiRoute);
app.use("/api/recommendations", recommendationRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/images", express.static('uploads'))
app.use("/uploads", express.static('uploads'))
app.use("/api/order", orderrouter);

app.get("/", (req, res) => {
    res.send("Api working")
})

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error('\n===================================================');
        console.error(`🚨 PORT ${port} IS ALREADY IN USE!`);
        console.error(`You have ANOTHER terminal window open that is already running the backend.`);
        console.error(`Please find the other terminal and close it, or press Ctrl+C to stop it.`);
        console.error('===================================================\n');
        process.exit(1);
    }
});

server.listen(port, () => { console.log(`Server started on ${port}`) });
