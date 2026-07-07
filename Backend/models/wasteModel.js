const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'inventory',
        required: true
    },
    ingredientName: {
        type: String,
        required: true
    },
    quantityWasted: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        enum: ['Expired', 'Spilled/Damaged', 'Burned/Overcooked', 'Other'],
        default: 'Other'
    },
    costLost: {
        type: Number,
        default: 0
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        default: null
    },
    dateLogged: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const wasteModel = mongoose.models.waste || mongoose.model('waste', wasteSchema);
module.exports = wasteModel;
