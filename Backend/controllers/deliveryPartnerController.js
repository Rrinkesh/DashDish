const deliveryPartnerModel = require('../models/deliveryPartnerModel');
const userModel = require('../models/usermodel');
const bcrypt = require('bcryptjs');

// Add a new Delivery Partner
const addPartner = async (req, res) => {
    try {
        const { name, email, password, phone, vehicleType, vehicleNumber, licenseNumber, profilePhoto } = req.body;
        
        // Ensure user is authorized
        const ownerId = req.body.userid; 
        const owner = await userModel.findById(ownerId);
        if (!owner) return res.json({ success: false, message: "Unauthorized" });

        // 1. Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email already exists" });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User account with role DELIVERY
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'DELIVERY',
            restaurantId: owner.restaurantId,
            isActive: true,
            isVerified: true,
            createdBy: ownerId
        });
        const savedUser = await newUser.save();

        // 4. Create Delivery Profile
        const newPartner = new deliveryPartnerModel({
            userId: savedUser._id,
            restaurantId: owner.restaurantId,
            phone,
            profilePhoto,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            availabilityStatus: 'OFFLINE'
        });
        await newPartner.save();

        res.json({ success: true, message: "Delivery Partner added successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error adding delivery partner" });
    }
};

// Get all Delivery Partners for a restaurant
const getPartners = async (req, res) => {
    try {
        const ownerId = req.body.userid;
        const owner = await userModel.findById(ownerId);
        
        // Find all users in this restaurant with role DELIVERY
        let query = { role: 'DELIVERY' };
        if (owner.restaurantId) {
            query.restaurantId = owner.restaurantId;
        }
        
        const deliveryUsers = await userModel.find(query);
        const userIds = deliveryUsers.map(u => u._id);

        let partners = await deliveryPartnerModel.find({ userId: { $in: userIds } }).populate('userId');
        
        // Self-healing: Create missing delivery profiles for users that failed to create one earlier
        const foundPartnerUserIds = partners.map(p => p.userId && p.userId._id ? p.userId._id.toString() : '');
        let needsRefetch = false;
        
        for (const user of deliveryUsers) {
            if (!foundPartnerUserIds.includes(user._id.toString())) {
                const newProfile = new deliveryPartnerModel({
                    userId: user._id,
                    restaurantId: user.restaurantId,
                    phone: user.phone,
                    availabilityStatus: 'OFFLINE'
                });
                await newProfile.save();
                needsRefetch = true;
            }
        }
        
        if (needsRefetch) {
            partners = await deliveryPartnerModel.find({ userId: { $in: userIds } }).populate('userId');
        }

        res.json({ success: true, data: partners });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching partners" });
    }
};

// Edit a Delivery Partner
const editPartner = async (req, res) => {
    try {
        const { partnerId, name, phone, vehicleType, vehicleNumber, licenseNumber, profilePhoto } = req.body;
        
        const partner = await deliveryPartnerModel.findById(partnerId);
        if (!partner) return res.json({ success: false, message: "Partner not found" });

        // Update User Model (name, phone)
        await userModel.findByIdAndUpdate(partner.userId, { name, phone });

        // Update Delivery Profile
        partner.phone = phone;
        partner.vehicleType = vehicleType;
        partner.vehicleNumber = vehicleNumber;
        partner.licenseNumber = licenseNumber;
        if (profilePhoto) partner.profilePhoto = profilePhoto;
        await partner.save();

        res.json({ success: true, message: "Partner updated successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating partner" });
    }
};

// Deactivate / Delete Partner
const togglePartnerStatus = async (req, res) => {
    try {
        const { partnerId, isActive } = req.body;
        const partner = await deliveryPartnerModel.findById(partnerId);
        if (!partner) return res.json({ success: false, message: "Partner not found" });

        await userModel.findByIdAndUpdate(partner.userId, { isActive });
        res.json({ success: true, message: `Partner ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error toggling partner status" });
    }
};

module.exports = { addPartner, getPartners, editPartner, togglePartnerStatus };
