const couponModel = require('../models/couponModel');
const ordermodel = require('../models/orderModel'); // For future validation
const mongoose = require('mongoose');

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const { restaurantId } = req.user; // Set by auth + roleMiddleware
        if (!restaurantId) return res.status(403).json({ success: false, message: "No restaurant assigned" });

        const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, applicableCategories, applicableOrderTypes } = req.body;

        const existing = await couponModel.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const newCoupon = new couponModel({
            code: code.toUpperCase(),
            restaurantId,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            expiryDate,
            usageLimit,
            applicableCategories,
            applicableOrderTypes
        });

        await newCoupon.save();
        res.json({ success: true, message: "Coupon created successfully", data: newCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating coupon" });
    }
};

// List all coupons for a restaurant
const getCoupons = async (req, res) => {
    try {
        const { restaurantId } = req.user;
        if (!restaurantId) return res.status(403).json({ success: false, message: "No restaurant assigned" });

        const coupons = await couponModel.find({ restaurantId });
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching coupons" });
    }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
    try {
        const { restaurantId } = req.user;
        const { id } = req.params;

        const coupon = await couponModel.findOneAndDelete({ _id: id, restaurantId });
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error deleting coupon" });
    }
};

// Validate coupon (Called from frontend Checkout)
const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, orderType } = req.body;
        // In multi-tenant, we should ideally know the restaurantId, but let's assume the order is for items in the cart.
        // For simplicity, we just find the active coupon.
        
        const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) return res.json({ success: false, message: "Invalid or expired coupon" });

        if (new Date() > coupon.expiryDate) {
            return res.json({ success: false, message: "Coupon has expired" });
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.json({ success: false, message: "Coupon usage limit reached" });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.json({ success: false, message: `Minimum order amount for this coupon is $${coupon.minOrderAmount}` });
        }

        if (orderType && coupon.applicableOrderTypes && !coupon.applicableOrderTypes.includes(orderType)) {
            return res.json({ success: false, message: `Coupon is not valid for ${orderType} orders` });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }

        res.json({ success: true, data: { discount, couponId: coupon._id } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error validating coupon" });
    }
};

module.exports = { createCoupon, getCoupons, deleteCoupon, validateCoupon };
