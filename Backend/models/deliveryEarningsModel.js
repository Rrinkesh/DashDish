const mongoose = require("mongoose");

const deliveryEarningsSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryPartner', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', required: true },
    baseFee: { type: Number, default: 0 },
    distanceBonus: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

const deliveryEarningsModel = mongoose.models.deliveryEarnings || mongoose.model("deliveryEarnings", deliveryEarningsSchema);

module.exports = deliveryEarningsModel;
