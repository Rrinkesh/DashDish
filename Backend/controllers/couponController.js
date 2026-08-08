const couponModel = require('../models/couponModel');
const ordermodel = require('../models/ordermodel'); // For future validation
const mongoose = require('mongoose');

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurantId || req.body?.restaurantId || req.user?._id || null;
        const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, applicableCategories, applicableOrderTypes } = req.body;

        if (!code || !discountValue || !expiryDate) {
            return res.status(400).json({ success: false, message: "Please provide coupon code, discount value, and expiry date" });
        }

        const normalizedCode = String(code).trim().toUpperCase();
        const existing = await couponModel.findOne({ code: normalizedCode });
        if (existing) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const newCoupon = new couponModel({
            code: normalizedCode,
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
        const restaurantId = req.user?.restaurantId || req.body?.restaurantId || req.user?._id || null;
        const query = restaurantId ? { restaurantId } : {};
        const coupons = await couponModel.find(query);
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching coupons" });
    }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
    try {
        const restaurantId = req.user?.restaurantId || req.body?.restaurantId || req.user?._id || null;
        const { id } = req.params;

        const filter = restaurantId ? { _id: id, restaurantId } : { _id: id };
        const coupon = await couponModel.findOneAndDelete(filter);
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
