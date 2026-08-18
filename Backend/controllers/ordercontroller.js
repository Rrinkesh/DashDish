const ordermodel =require('../models/ordermodel.js');
const usermodel =require('../models/usermodel.js');
const Stripe =require('stripe');
require("dotenv").config();

const stripe =new Stripe(process.env.STRIPE_SECRET_KEY);


//placing userorder from frontend...

const placeorder = async (req, res) => {
    const frontendurl = process.env.FRONTEND_URL || "http://localhost:5173";
    try {


        let pickupToken = null;
        if (req.body.orderType === 'PICKUP') {
            pickupToken = Math.random().toString(36).substring(2, 6).toUpperCase();
        }

        const neworder = new ordermodel({
            userid: req.body.userid,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address || {},
            orderType: req.body.orderType || 'DELIVERY',
            tableNumber: req.body.tableNumber || null,
            pickupToken: pickupToken,
            pickupTime: req.body.pickupTime || null,
            deliveryInstructions: req.body.deliveryInstructions || "",
            
            // New Payment/Billing fields
            paymentMethod: req.body.paymentMethod || 'Stripe',
            couponId: (req.body.couponId && req.body.couponId !== "") ? req.body.couponId : null,
            discountAmount: req.body.discountAmount || 0,
            taxAmount: req.body.taxAmount || 0,
            deliveryFee: req.body.deliveryFee || 0,
            packingFee: req.body.packingFee || 0,
            grandTotal: req.body.grandTotal || req.body.amount,
            paymentStatus: req.body.paymentMethod === 'COD' || req.body.paymentMethod === 'PayAtPickup' || req.body.paymentMethod === 'PayAtRestaurant' ? 'Pending' : 'Pending',
        });
        await neworder.save();
        await usermodel.findByIdAndUpdate(req.body.userid, { cartdata: {} });

        if (req.body.paymentMethod === 'Stripe') {
            const line_items = req.body.items.map((item) => ({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity
            }));

            line_items.push({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Delivery Charge"
                    },
                    unit_amount: Math.round((req.body.deliveryFee || 2) * 100)
                },
                quantity: 1,
            });
            const session = await stripe.checkout.sessions.create({
                line_items: line_items,
                mode: 'payment',
                success_url: `${frontendurl}/verify?success=true&orderid=${neworder._id}`,
                cancel_url: `${frontendurl}/verify?success=false&orderid=${neworder._id}`
            });
            return res.json({ success: true, session_url: session.url });
        } 
        
        // For Razorpay, COD, PayAtPickup, we just return the order ID
        return res.json({ success: true, orderId: neworder._id });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "error" });
    }
}

const { getIo } = require('../socket/socketHandler');
const { calculateETA } = require('../services/queueService');

const verifyorder =async (req,res)=>{
 const {orderid,success} =req.body;
 try {
    if(success=="true"){
        await ordermodel.findByIdAndUpdate(orderid,{payment:true, paymentStatus: 'Paid'});
        
        // Broadcast new order to kitchen and admin
        try {
            const io = getIo();
            const order = await ordermodel.findById(orderid);
            io.to("kitchen").to("admin").emit("order:new", order);
        } catch(e) { console.error("Socket emit failed", e); }
        
        res.json({success:true,message:"paid"})
    }
    else{
        const order = await ordermodel.findById(orderid);
        await ordermodel.findByIdAndDelete(orderid);
        res.json({
            success:false,message:"not paid"
        })
    }
 } catch (error) {
    console.log(error)
    res.json({success:false,message:"error"})
 }
}

//userorder for frontend...
const userorders =async(req,res) =>{
try {
    const orders=await ordermodel.find({userid:req.body.userid})
    
    // Attach ETA to each order dynamically
    const ordersWithETA = await Promise.all(orders.map(async (order) => {
        const orderObj = order.toObject();
        if (order.status !== "Completed" && order.status !== "Ready") {
            const eta = await calculateETA(order._id);
            orderObj.queueData = eta;
        }
        return orderObj;
    }));
    
    res.json({success:true,data:ordersWithETA})
} catch (error) {
    console.log(error);
    res.json({success:false,
        message:error
    })
}
}
//listing order for admin panel...
const listorders=async(req,res) =>{
try {
    const orders=await ordermodel.find({});
    res.json({success:true,
        data:orders
    })
} catch (error) {
    console.log(error);
    res.json({
        success:false,
        message:"error"
    })
}
}
//api for updating order status...
const updatestatus = async(req,res) => {
    try {
        const order = await ordermodel.findById(req.body.orderid);
        if (!order) return res.json({ success: false, message: "Order not found" });

        const newStatus = req.body.status;
        
        // Determine if it's a general status or delivery status
        const deliveryStatuses = ['Waiting For Assignment', 'Driver Assigned', 'Driver Accepted', 'Picked Up', 'On The Way', 'Nearby', 'Delivered'];
        if (deliveryStatuses.includes(newStatus)) {
            order.deliveryStatus = newStatus;
            
            // Phase 3C: Generate OTP when Driver is Nearby
            if (newStatus === 'Nearby') {
                const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
                order.deliveryOTP = generatedOtp;
                order.otpExpiresAt = new Date(Date.now() + 15 * 60000); // 15 mins expiry
            }
        } else {
            order.status = newStatus;
        }

        await order.save();
        
        // Rollback inventory if cancelled
        if (newStatus === 'Cancelled') {
            // Inventory restored logic removed
        }
        
        // Broadcast status update
        try {
            const io = getIo();
            const statusStr = newStatus;
            let eventName = "order:updated";
            if(statusStr === "Accepted") eventName = "order:accepted";
            if(statusStr === "Preparing") eventName = "order:preparing";
            if(statusStr === "Ready") eventName = "order:ready";
            if(statusStr === "Completed") eventName = "order:completed";
            
            // Notify specific customer
            if(order.userid) {
                io.to(`customer_${order.userid}`).emit(eventName, order);
                io.to(`order_${order._id}`).emit(eventName, order);
            }
            // Notify kitchen and admin and display
            io.to("kitchen").to("admin").to("display_screen").emit(eventName, order);
            
            // Also emit a general queue update so display/kitchen can recalculate queue if needed
            io.emit("queue:updated");
        } catch(e) { console.error("Socket emit failed", e); }
        
        res.json({success:true,message:"status updated", data: order})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"error"})
        
    }
}

// Customer Rates Driver
const rateDriver = async (req, res) => {
    try {
        const { orderId, rating, review } = req.body;
        const order = await ordermodel.findById(orderId);
        
        if (!order) return res.json({ success: false, message: "Order not found" });
        if (order.deliveryStatus !== 'Delivered') return res.json({ success: false, message: "Cannot rate undelivered order" });

        order.driverRating = rating;
        order.driverReview = review;
        await order.save();

        const deliveryPartnerModel = require('../models/deliveryPartnerModel');
        if (order.deliveryPartnerId) {
            const driverOrders = await ordermodel.find({ deliveryPartnerId: order.deliveryPartnerId, driverRating: { $ne: null } });
            const totalRating = driverOrders.reduce((acc, curr) => acc + curr.driverRating, 0);
            const avgRating = totalRating / driverOrders.length;
            await deliveryPartnerModel.findByIdAndUpdate(order.deliveryPartnerId, { rating: avgRating });
        }

        try {
            const io = getIo();
            io.to("admin").emit("driver_rated", order);
        } catch(e) {}

        res.json({ success: true, message: "Driver rated successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error rating driver" });
    }
}

module.exports={placeorder,verifyorder,userorders,listorders,updatestatus,rateDriver};