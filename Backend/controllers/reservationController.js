const reservationModel = require('../models/reservationModel');
const usermodel = require('../models/usermodel');
const restaurantModel = require('../models/restaurantModel');
const { getIo } = require('../socket/socketHandler');

const createReservation = async (req, res) => {
    try {
        const { date, time, guests } = req.body;
        // In a single-tenant or default scenario, get the main restaurant
        // Or if passed, use req.body.restaurantId. We'll default to the first one for simplicity here
        let restaurantId = req.body.restaurantId;
        if (!restaurantId) {
            const rest = await restaurantModel.findOne();
            restaurantId = rest ? rest._id : null;
        }

        const newReservation = new reservationModel({
            customerId: req.body.userid,
            restaurantId,
            date,
            time,
            guests
        });
        
        await newReservation.save();
        
        // Notify admin about new reservation
        try {
            const io = getIo();
            io.to("admin").emit("reservation:new", newReservation);
        } catch(e) {}
        
        res.json({ success: true, message: "Reservation created successfully", data: newReservation });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error creating reservation" });
    }
};

const getUserReservations = async (req, res) => {
    try {
        const reservations = await reservationModel.find({ customerId: req.body.userid }).sort({ date: -1 });
        res.json({ success: true, data: reservations });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching user reservations" });
    }
};

const getAdminReservations = async (req, res) => {
    try {
        const user = await usermodel.findById(req.body.userid);
        if (!user || !user.restaurantId) {
            return res.json({ success: false, message: "Not authorized or no restaurant found" });
        }
        const reservations = await reservationModel.find({ restaurantId: user.restaurantId }).sort({ date: 1 });
        res.json({ success: true, data: reservations });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching reservations" });
    }
};

const updateReservationStatus = async (req, res) => {
    try {
        const { reservationId, status } = req.body;
        const reservation = await reservationModel.findByIdAndUpdate(reservationId, { status }, { new: true });
        
        // Notify customer
        try {
            const io = getIo();
            io.to(`customer_${reservation.customerId}`).emit("reservation:updated", reservation);
        } catch(e) {}
        
        res.json({ success: true, message: "Reservation updated", data: reservation });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating reservation" });
    }
};

module.exports = { createReservation, getUserReservations, getAdminReservations, updateReservationStatus };
