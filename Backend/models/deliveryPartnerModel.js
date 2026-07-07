const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' },
    vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Cycle', 'Car'], default: 'Bike' },
    vehicleNumber: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    phone: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    availabilityStatus: { type: String, enum: ['ONLINE', 'OFFLINE', 'BUSY'], default: 'OFFLINE' },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    currentOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order' }],
    activeDeliveries: { type: Number, default: 0 },
    completedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order' }],
    rating: { type: Number, default: 5.0 },
    totalDistance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now }
}, { timestamps: true });

const deliveryPartnerModel = mongoose.models.deliveryPartner || mongoose.model("deliveryPartner", deliveryPartnerSchema);
module.exports = deliveryPartnerModel;
