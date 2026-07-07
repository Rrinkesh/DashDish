const usermodel = require('../models/usermodel');
const restaurantModel = require('../models/restaurantModel');
const bcrypt = require('bcrypt');
const validator = require('validator');

// --- STAFF MANAGEMENT ---

// Get all staff for a restaurant
const getStaff = async (req, res) => {
    try {
        // Find users, excluding CUSTOMER
        const staff = await usermodel.find({ 
            role: { $ne: 'CUSTOMER' }
        }).select('-password');
        
        res.json({ success: true, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching staff" });
    }
};

// Invite (Create) Staff
const inviteStaff = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { name, email, phone, role, temporaryPassword } = req.body;

        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
        if (temporaryPassword.length < 8) return res.json({ success: false, message: "Password must be at least 8 chars" });

        let user = await usermodel.findOne({ email });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        if (user) {
            // If user exists but is already staff somewhere else (and role is defined)
            if (user.role && user.role !== 'CUSTOMER' && user.role !== 'user') {
                return res.json({ success: false, message: "User is already a staff member or admin elsewhere." });
            }
            // Upgrade existing customer to staff
            user.role = role;
            user.password = hashedPassword;
            user.isVerified = true;
            user.invitedBy = ownerId;
            if (name) user.name = name;
            if (phone) user.phone = phone;
            await user.save();
            console.log(`[SIMULATED EMAIL] To: ${email}. Subject: Your DashDish account was upgraded! Your new role: ${role}. Temp Password: ${temporaryPassword}`);
            return res.json({ success: true, message: "Existing customer upgraded to staff successfully." });
        }

        // Create new user if they don't exist
        const newStaff = new usermodel({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            isVerified: true, 
            createdBy: ownerId,
            invitedBy: ownerId
        });

        await newStaff.save();

        // Simulate sending email
        console.log(`[SIMULATED EMAIL] To: ${email}. Subject: You're invited to join DashDish! Your role: ${role}. Temp Password: ${temporaryPassword}`);

        res.json({ success: true, message: "Staff invited successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error inviting staff" });
    }
};

// Update Staff
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, role, isActive } = req.body;

        const staff = await usermodel.findOne({ _id: id });
        if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

        if (name) staff.name = name;
        if (phone) staff.phone = phone;
        if (role) staff.role = role;
        if (isActive !== undefined) staff.isActive = isActive;

        await staff.save();
        res.json({ success: true, message: "Staff updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating staff" });
    }
};

// Delete Staff
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const staff = await usermodel.findOneAndDelete({ _id: id });
        if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

        res.json({ success: true, message: "Staff removed successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error deleting staff" });
    }
};


// --- RESTAURANT SETTINGS ---

// Get current restaurant settings
const getRestaurantSettings = async (req, res) => {
    try {
        // We assume there's only one restaurant for the singleton
        const restaurant = await restaurantModel.findOne();
        if (!restaurant) return res.json({ success: false, message: "Settings not found" });
        res.json({ success: true, data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching restaurant settings" });
    }
};

// Update restaurant settings
const updateRestaurantSettings = async (req, res) => {
    try {
        const updatedData = req.body;
        // Find the single restaurant document
        const restaurant = await restaurantModel.findOneAndUpdate({}, updatedData, { new: true, upsert: true });
        
        res.json({ success: true, message: "Settings updated successfully", data: restaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating restaurant" });
    }
};

// Endpoint specifically to create a restaurant (for SUPER_ADMIN or onboarding flow)
const createRestaurant = async (req, res) => {
    try {
        // Just for demo onboarding
        const { name, ownerEmail } = req.body;
        
        const owner = await usermodel.findOne({ email: ownerEmail });
        if (!owner) return res.json({ success: false, message: "Owner not found" });

        const newRestaurant = new restaurantModel({
            name,
            email: ownerEmail
        });
        await newRestaurant.save();

        owner.role = 'OWNER';
        await owner.save();

        res.json({ success: true, message: "Restaurant created and linked to owner", data: newRestaurant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating restaurant" });
    }
};

module.exports = {
    getStaff, inviteStaff, updateStaff, deleteStaff,
    getRestaurantSettings, updateRestaurantSettings, createRestaurant
};
