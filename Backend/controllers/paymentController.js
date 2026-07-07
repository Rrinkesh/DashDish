const Razorpay = require('razorpay');
const crypto = require('crypto');
const orderModel = require('../models/orderModel');
const paymentModel = require('../models/paymentModel');
const { getIo } = require('../socket/socketHandler');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocksecret123'
});

// 1. Create Order (Returns Razorpay order ID to frontend)
const createPaymentOrder = async (req, res) => {
    try {
        const { orderId, amount } = req.body; // Amount in rupees (or whatever currency)
        
        // Ensure amount is an integer (paise)
        const amountInPaise = Math.round(amount * 100);
        
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${orderId}`,
            payment_capture: 1
        };

        const response = await razorpay.orders.create(options);
        
        // We can update our order to temporarily store the Razorpay transaction/order ID if needed
        await orderModel.findByIdAndUpdate(orderId, { transactionId: response.id });

        res.json({
            success: true,
            id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ success: false, message: "Could not initiate payment" });
    }
};

// 2. Verify Signature (Called by frontend after successful payment)
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, method, customerId } = req.body;
        
        const secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret123';
        
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Transaction not legit!" });
        }

        // Signature is valid! Update Order Status
        const order = await orderModel.findById(orderId);
        if(!order) return res.json({success: false, message: "Order not found"});

        order.payment = true;
        order.paymentStatus = 'Paid';
        order.paymentMethod = method || 'Card';
        order.paymentId = razorpay_payment_id;
        await order.save();

        // Create Payment Record
        const paymentRecord = new paymentModel({
            order: orderId,
            customer: customerId || order.userid,
            restaurant: order.restaurantId || null,
            gateway: 'Razorpay',
            status: 'Completed',
            amount: order.grandTotal || order.amount,
            transactionId: razorpay_payment_id,
        });
        await paymentRecord.save();

        // Emit socket event
        try {
            const io = getIo();
            io.to(`customer_${order.userid}`).emit("payment_success", { orderId, paymentId: razorpay_payment_id });
            io.to("admin").to("kitchen").emit("order:new", order); // Broadcast to admin
        } catch(e) { console.error("Socket emit failed", e); }

        res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        console.error("Razorpay Verification Error:", error);
        res.status(500).json({ success: false, message: "Error verifying payment" });
    }
};

// 3. Webhook (Optional, for safety if frontend closes before verifying)
const razorpayWebhook = async (req, res) => {
    // In production, verify the webhook signature using process.env.RAZORPAY_WEBHOOK_SECRET
    // ...
    const event = req.body.event;
    
    if (event === 'payment.captured') {
        const paymentData = req.body.payload.payment.entity;
        const orderId = paymentData.notes.orderId; // Requires sending orderId in notes during creation
        
        // Safety check to update order if not already paid
    }
    
    res.status(200).send('OK');
};

// 4. Initiate Refund
const initiateRefund = async (req, res) => {
    try {
        const { paymentId, amount, reason, orderId } = req.body;
        
        // Amount in paise
        const refundAmount = amount ? Math.round(amount * 100) : undefined;
        
        const params = {
            notes: { reason, orderId }
        };
        
        if(refundAmount) {
            params.amount = refundAmount; // Partial refund
        }
        
        const refund = await razorpay.payments.refund(paymentId, params);
        
        // Update Payment model
        const paymentRecord = await paymentModel.findOne({ transactionId: paymentId });
        if(paymentRecord) {
            paymentRecord.status = refundAmount ? 'Partially Refunded' : 'Refunded';
            paymentRecord.refunds.push({
                amount: refundAmount ? amount : paymentRecord.amount,
                reason,
                refundId: refund.id,
                status: refund.status
            });
            await paymentRecord.save();
        }
        
        // Update Order model
        const order = await orderModel.findById(orderId);
        if(order) {
            order.paymentStatus = refundAmount ? 'Partially Refunded' : 'Refunded';
            await order.save();
        }

        // Notify via socket
        try {
            const io = getIo();
            if(order && order.userid) {
                io.to(`customer_${order.userid}`).emit("refund_initiated", { orderId, amount, reason });
            }
        } catch(e) {}
        
        res.json({ success: true, message: "Refund initiated", data: refund });
    } catch (error) {
        console.error("Razorpay Refund Error:", error);
        res.status(500).json({ success: false, message: "Error initiating refund" });
    }
};

module.exports = { createPaymentOrder, verifyPayment, razorpayWebhook, initiateRefund };
