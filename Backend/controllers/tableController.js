const tableModel = require('../models/tableModel');
const usermodel = require('../models/usermodel');

const addTable = async (req, res) => {
    try {
        const { tableNumber, capacity } = req.body;
        // Verify owner
        const user = await usermodel.findById(req.body.userid);
        if (!user || !user.restaurantId) {
            return res.json({ success: false, message: "Not authorized or no restaurant found" });
        }

        const newTable = new tableModel({
            restaurantId: user.restaurantId,
            tableNumber,
            capacity
        });
        
        // Generate a simple QR code URL representing this table
        // We assume the frontend customer app is hosted at frontendurl
        const frontendurl = "http://localhost:5173";
        // Let's use the restaurantId for the slug, or just generic if it's single tenant right now
        newTable.qrCodeData = `${frontendurl}/table/${newTable._id}`;

        await newTable.save();
        res.json({ success: true, message: "Table added successfully", data: newTable });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error adding table" });
    }
};

const getTables = async (req, res) => {
    try {
        const user = await usermodel.findById(req.body.userid);
        if (!user || !user.restaurantId) {
            return res.json({ success: false, message: "Not authorized or no restaurant found" });
        }
        const tables = await tableModel.find({ restaurantId: user.restaurantId }).sort({ tableNumber: 1 });
        res.json({ success: true, data: tables });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching tables" });
    }
};

const updateTableStatus = async (req, res) => {
    try {
        const { tableId, status } = req.body;
        await tableModel.findByIdAndUpdate(tableId, { status });
        res.json({ success: true, message: "Table status updated" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating table status" });
    }
};

const removeTable = async (req, res) => {
    try {
        await tableModel.findByIdAndDelete(req.body.tableId);
        res.json({ success: true, message: "Table removed" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error removing table" });
    }
};

// For customer to get table details by ID
const getTableDetails = async (req, res) => {
    try {
        const table = await tableModel.findById(req.params.id);
        if (!table) return res.json({ success: false, message: "Table not found" });
        res.json({ success: true, data: table });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching table details" });
    }
}

module.exports = { addTable, getTables, updateTableStatus, removeTable, getTableDetails };
