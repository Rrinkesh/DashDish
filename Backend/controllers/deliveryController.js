const deliveryPartnerModel = require('../models/deliveryPartnerModel');
const orderModel = require('../models/ordermodel');
const userModel = require('../models/usermodel');
const { getIo } = require('../socket/socketHandler');

// Driver updates their availability
const updateAvailability = async (req, res) => {
    try {
        const { status } = req.body;
        const driver = await deliveryPartnerModel.findOneAndUpdate(
            { userId: req.body.userid },
            { availabilityStatus: status },
            { new: true, upsert: true } // Upsert in case profile isn't created yet
        ).populate('userId');

        try {
            const io = getIo();
            io.to("admin").emit("driver_status_changed", { driver });
        } catch (e) {}

        res.json({ success: true, message: `Status updated to ${status}`, data: driver });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating availability" });
    }
};

// Owner/Manager assigns a driver to an order
const assignDriver = async (req, res) => {
    try {
        const { orderId, driverId } = req.body;
        
        // Find order
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        // Update order
        order.deliveryPartnerId = driverId;
        order.deliveryStatus = "Driver Assigned";
        order.assignedBy = req.body.userid;
        order.assignedAt = new Date();
        await order.save();

        // Find driver
        const driver = await deliveryPartnerModel.findById(driverId).populate('userId');

        // Socket notifications
        try {
            const io = getIo();
            // Notify Customer
            io.to(`customer_${order.userid}`).emit("delivery:assigned", { order, driver });
            // Notify Driver
            io.to(`driver_${driver.userId._id.toString()}`).emit("delivery:assigned", { order });
            // Update Dashboard
            io.to("admin").emit("delivery:updated", { order });
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        res.json({ success: true, message: "Driver assigned successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error assigning driver" });
    }
};

// Driver verifies OTP
const verifyOTP = async (req, res) => {
    try {
        const { orderId, otp } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) return res.json({ success: false, message: "Order not found" });

        // Phase 3C logic
        if (order.deliveryOTP === otp) {
            // Check expiry
            if (new Date() > new Date(order.otpExpiresAt)) {
                return res.json({ success: false, message: "OTP Expired" });
            }

            order.otpVerified = true;
            await order.save();

            try {
                const io = getIo();
                io.to(`order_${order._id}`).emit("otp_verified", { orderId: order._id });
                io.to("admin").emit("order:updated", order);
            } catch (e) { console.error("Socket emit failed", e); }

            res.json({ success: true, message: "OTP verified. Proceed to upload proof." });
        } else {
            res.json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error verifying OTP" });
    }
};

const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const deliveryEarningsModel = require('../models/deliveryEarningsModel');

// Generate PDF
const generateInvoice = async (order, owner) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const invoiceName = `invoice_${order._id}.pdf`;
            const invoicePath = path.join(__dirname, '..', 'uploads', invoiceName);
            
            // Ensure uploads directory exists
            if (!fs.existsSync(path.join(__dirname, '..', 'uploads'))) {
                fs.mkdirSync(path.join(__dirname, '..', 'uploads'));
            }

            const stream = fs.createWriteStream(invoicePath);
            doc.pipe(stream);

            doc.fontSize(20).text('Delivery Invoice', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Order ID: ${order._id}`);
            doc.text(`Date: ${new Date().toLocaleDateString()}`);
            doc.text(`Customer: ${order.address.firstname} ${order.address.lastname}`);
            doc.text(`Address: ${order.address.street}, ${order.address.city}`);
            doc.moveDown();

            doc.text('Items:');
            order.items.forEach(item => {
                doc.text(`- ${item.name} x ${item.quantity} ($${item.price})`);
            });
            doc.moveDown();
            doc.fontSize(14).text(`Total: $${order.amount}.00`, { align: 'right' });

            doc.end();

            stream.on('finish', () => {
                resolve(`/uploads/${invoiceName}`);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Driver completes delivery with proof
const completeDelivery = async (req, res) => {
    try {
        const { orderId, proofImage } = req.body;
        const order = await orderModel.findById(orderId).populate('assignedBy');

        if (!order) return res.json({ success: false, message: "Order not found" });
        if (!order.otpVerified) return res.json({ success: false, message: "OTP not verified yet" });

        // Generate Invoice
        let invoiceUrl = null;
        try {
            invoiceUrl = await generateInvoice(order, order.assignedBy);
        } catch(e) { console.error("PDF Gen error", e); }

        order.deliveryStatus = "Delivered";
        order.status = "Completed";
        order.deliveryCompletedAt = new Date();
        order.deliveryProof = proofImage;
        order.invoiceId = invoiceUrl;
        await order.save();

        // Update Driver status
        if (order.deliveryPartnerId) {
            const driver = await deliveryPartnerModel.findById(order.deliveryPartnerId);
            if (driver) {
                driver.completedOrders.push(order._id);
                driver.availabilityStatus = 'ONLINE'; // Free up driver
                await driver.save();

                // Calculate Earnings (Base $3 + Distance Bonus $1)
                const newEarning = new deliveryEarningsModel({
                    driverId: driver._id,
                    orderId: order._id,
                    restaurantId: order.assignedBy.restaurantId,
                    baseFee: 3.0,
                    distanceBonus: 1.0,
                    totalEarnings: 4.0
                });
                await newEarning.save();
            }
        }

        try {
            const io = getIo();
            io.to(`customer_${order.userid}`).emit("delivery_completed", { order });
            io.to(`order_${order._id}`).emit("delivery_completed", { order });
            io.to("admin").emit("order:updated", order);
            io.to("admin").emit("earnings_updated");
        } catch (e) { console.error("Socket emit failed", e); }

        res.json({ success: true, message: "Delivery Completed Successfully!", invoice: invoiceUrl });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error completing delivery" });
    }
};

const getAvailableDrivers = async (req, res) => {
    try {
        const ownerId = req.body.userid;
        const owner = await userModel.findById(ownerId);
        
        // Find users for this restaurant with DELIVERY role
        const deliveryUsers = await userModel.find({ restaurantId: owner.restaurantId, role: 'DELIVERY' });
        const userIds = deliveryUsers.map(u => u._id);

        const drivers = await deliveryPartnerModel.find({ userId: { $in: userIds }, availabilityStatus: 'ONLINE' }).populate('userId');
        res.json({ success: true, data: drivers });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching drivers" });
    }
};

const acceptDelivery = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        // Update Order
        order.deliveryStatus = "Driver Accepted";
        await order.save();

        // Update Driver
        const driver = await deliveryPartnerModel.findOneAndUpdate(
            { userId: req.body.userid },
            { 
                availabilityStatus: 'BUSY',
                $inc: { activeDeliveries: 1 } 
            },
            { new: true }
        );

        // Notify
        try {
            const io = getIo();
            io.to("admin").emit("delivery:accepted", { order, driver });
            io.to(`customer_${order.userid}`).emit("order:updated", { order });
            io.to("admin").emit("driver_status_changed", { driver });
        } catch (e) {}

        res.json({ success: true, message: "Delivery Accepted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error accepting delivery" });
    }
};

const rejectDelivery = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        // Find driver details to emit who rejected
        const driver = await deliveryPartnerModel.findOne({ userId: req.body.userid });

        // Update Order
        order.deliveryPartnerId = null;
        order.deliveryStatus = "Waiting For Assignment";
        order.assignedBy = null;
        order.assignedAt = null;
        await order.save();

        // Notify
        try {
            const io = getIo();
            io.to("admin").emit("delivery:rejected", { order, driver });
        } catch (e) {}

        res.json({ success: true, message: "Delivery Rejected" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error rejecting delivery" });
    }
};

module.exports = { updateAvailability, assignDriver, verifyOTP, completeDelivery, getAvailableDrivers, acceptDelivery, rejectDelivery };
