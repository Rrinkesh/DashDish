const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', required: true },
    tableNumber: { type: Number, required: true },
    capacity: { type: Number, default: 4 },
    status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Cleaning'], default: 'Available' },
    qrCodeData: { type: String, default: "" }
}, { timestamps: true });

const tableModel = mongoose.models.table || mongoose.model("table", tableSchema);
module.exports = tableModel;
