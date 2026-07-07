const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    ingredientName: {
        type: String,
        required: true,
        trim: true
    },
    quantityAvailable: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        enum: ['kg', 'g', 'pcs', 'liters', 'ml'],
        required: true,
        default: 'pcs'
    },
    minimumThreshold: {
        type: Number,
        required: true,
        default: 10
    },
    pricePerUnit: {
        type: Number,
        default: 0
    },
    totalConsumed: {
        type: Number,
        default: 0
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        default: null // null implies a global or single-tenant system
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const inventoryModel = mongoose.models.inventory || mongoose.model('inventory', inventorySchema);

module.exports = inventoryModel;
