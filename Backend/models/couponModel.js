const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, uppercase: true, unique: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', default: null }, // Owner creates coupons; optional for admin fallback
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' },
    discountValue: { type: Number, required: true }, // % or flat amount
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null }, // For percentage, cap the max discount
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // Max times it can be used overall
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableCategories: { type: [String], default: [] },
    applicableOrderTypes: { type: [String], enum: ['DELIVERY', 'PICKUP', 'DINE_IN'], default: ['DELIVERY', 'PICKUP', 'DINE_IN'] }
});

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);
module.exports = couponModel;
