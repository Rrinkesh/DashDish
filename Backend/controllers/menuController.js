const menuModel = require("../models/menuModel");
const fs = require('fs');

// Add Menu Category
const addCategory = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Image is required" });
    }
    let image_filename = `${req.file.filename}`;
    
    const menu = new menuModel({
        name: req.body.name,
        image: image_filename
    });
    
    try {
        await menu.save();
        res.json({ success: true, message: "Category added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// List Menu Categories
const listCategory = async (req, res) => {
    try {
        const categories = await menuModel.find({});
        res.json({ success: true, data: categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching categories" });
    }
};

// Remove Menu Category
const removeCategory = async (req, res) => {
    try {
        const category = await menuModel.findById(req.body.id);
        if(category) {
            fs.unlink(`uploads/${category.image}`, () => {});
            await menuModel.findByIdAndDelete(req.body.id);
            res.json({ success: true, message: "Category deleted successfully" });
        } else {
            res.json({ success: false, message: "Category not found" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting category" });
    }
};

module.exports = { addCategory, listCategory, removeCategory };
