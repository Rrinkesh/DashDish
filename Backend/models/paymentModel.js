const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' },
    gateway: { type: String, enum: ['Razorpay', 'Stripe', 'Cash', 'Offline'], default: 'Razorpay' },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Partially Refunded'], default: 'Pending' },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    gatewayResponse: { type: Object }, // Store entire webhook payload or response for debugging
    refunds: [{
        amount: Number,
        reason: String,
        refundId: String,
        status: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const paymentModel = mongoose.models.payment || mongoose.model("payment", paymentSchema);
module.exports = paymentModel;
