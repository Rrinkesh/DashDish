const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gstNumber: { type: String, default: "" },
    restaurantType: { type: String, default: "General" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    themeColor: { type: String, default: "#3498db" },
    deliveryRadius: { type: Number, default: 5 }, // in km
    orderModes: { 
        delivery: { type: Boolean, default: true },
        pickup: { type: Boolean, default: true },
        dineIn: { type: Boolean, default: false }
    },
    address: { type: Object, default: {} },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    openingHours: { type: String, default: "09:00 AM" },
    closingHours: { type: String, default: "10:00 PM" },
    description: { type: String, default: "" },
    socialLinks: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
    reservationSettings: {
        allowReservations: { type: Boolean, default: true },
        maxAdvanceDays: { type: Number, default: 30 },
        requirePreorder: { type: Boolean, default: false }
    }
}, { timestamps: true });

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
module.exports = restaurantModel;
