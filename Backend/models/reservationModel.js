const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    customerId: { type: String, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'table', required: false },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' }
}, { timestamps: true });

const reservationModel = mongoose.models.reservation || mongoose.model("reservation", reservationSchema);
module.exports = reservationModel;
