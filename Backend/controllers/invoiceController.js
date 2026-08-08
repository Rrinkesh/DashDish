const invoiceModel = require('../models/invoiceModel');
const orderModel = require('../models/ordermodel');
const restaurantModel = require('../models/restaurantModel');
const usermodel = require('../models/usermodel');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Generate Invoice for an order
const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Check if invoice already exists
        if (order.invoiceId) {
            const existing = await invoiceModel.findById(order.invoiceId);
            return res.json({ success: true, message: "Invoice already exists", data: existing });
        }

        const customer = await usermodel.findById(order.userid);
        // Assuming single tenant or order has restaurantId
        let restaurant = null;
        if (order.restaurantId) {
            restaurant = await restaurantModel.findById(order.restaurantId);
        } else {
            // Fallback for demo
            restaurant = await restaurantModel.findOne(); 
        }

        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newInvoice = new invoiceModel({
            invoiceNumber,
            restaurant: restaurant ? restaurant._id : null,
            customer: customer._id,
            order: order._id,
            items: order.items,
            gstDetails: {
                gstNumber: restaurant ? restaurant.gstNumber : "N/A",
                cgst: order.taxAmount ? order.taxAmount / 2 : 0,
                sgst: order.taxAmount ? order.taxAmount / 2 : 0,
                igst: 0
            },
            subtotal: order.amount - (order.taxAmount || 0) - (order.deliveryFee || 0) - (order.packingFee || 0),
            discount: order.discountAmount || 0,
            tax: order.taxAmount || 0,
            total: order.grandTotal || order.amount
        });

        await newInvoice.save();

        order.invoiceId = newInvoice._id;
        await order.save();

        res.json({ success: true, message: "Invoice generated", data: newInvoice });

    } catch (error) {
        console.error("Generate Invoice Error:", error);
        res.status(500).json({ success: false, message: "Error generating invoice" });
    }
};

const getInvoice = async (req, res) => {
    try {
        const invoice = await invoiceModel.findById(req.params.id).populate('customer').populate('restaurant');
        if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
        res.json({ success: true, data: invoice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching invoice" });
    }
};

const downloadInvoicePdf = async (req, res) => {
    try {
        const invoice = await invoiceModel.findById(req.params.id).populate('customer').populate('restaurant').populate('order');
        if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('TAX INVOICE', { align: 'center' });
        doc.moveDown();

        // Restaurant & Customer Info
        doc.fontSize(12);
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${new Date(invoice.generatedAt).toLocaleString()}`);
        doc.moveDown();
        
        doc.text(`Restaurant: ${invoice.restaurant ? invoice.restaurant.name : 'DashDish'}`);
        doc.text(`GST No: ${invoice.gstDetails.gstNumber}`);
        
        doc.moveDown();
        doc.text(`Bill To: ${invoice.customer ? invoice.customer.name : 'Customer'}`);
        doc.text(`Email: ${invoice.customer ? invoice.customer.email : ''}`);
        
        doc.moveDown(2);

        // Items Table Header
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, doc.y, { continued: true, width: 250 });
        doc.text('Qty', 300, doc.y, { continued: true, width: 50 });
        doc.text('Price', 350, doc.y, { continued: true, width: 70 });
        doc.text('Total', 420, doc.y);
        doc.font('Helvetica');
        
        doc.moveTo(50, doc.y + 5).lineTo(500, doc.y + 5).stroke();
        doc.moveDown();

        // Items
        let y = doc.y;
        invoice.items.forEach(item => {
            doc.text(item.name, 50, y, { width: 250 });
            doc.text(item.quantity.toString(), 300, y, { width: 50 });
            doc.text(`$${item.price}`, 350, y, { width: 70 });
            doc.text(`$${item.price * item.quantity}`, 420, y);
            y += 20;
        });

        doc.moveTo(50, y + 5).lineTo(500, y + 5).stroke();
        doc.y = y + 15;

        // Totals
        doc.text(`Subtotal: $${invoice.subtotal}`, { align: 'right' });
        if (invoice.discount > 0) doc.text(`Discount: -$${invoice.discount}`, { align: 'right' });
        doc.text(`Tax: $${invoice.tax}`, { align: 'right' });
        doc.font('Helvetica-Bold').fontSize(14).text(`Total: $${invoice.total}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error generating PDF" });
    }
};

module.exports = { generateInvoice, getInvoice, downloadInvoicePdf };
