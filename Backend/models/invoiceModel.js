const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'order', required: true },
    items: { type: Array, required: true },
    gstDetails: {
        gstNumber: String,
        cgst: Number,
        sgst: Number,
        igst: Number
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String } // Optional: link to stored PDF if using cloud storage
});

const invoiceModel = mongoose.models.invoice || mongoose.model("invoice", invoiceSchema);
module.exports = invoiceModel;
