const reviewModel = require("../models/reviewModel");
const foodmodel = require("../models/foodmodel");
const usermodel = require("../models/usermodel");

// Add or update a review
const addReview = async (req, res) => {
    try {
        const { foodId, rating, review } = req.body;
        const userId = req.body.userid; // coming from auth middleware

        if (!foodId || !rating) {
            return res.json({ success: false, message: "Missing required fields" });
        }
        
        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        if (review && review.length > 500) {
            return res.json({ success: false, message: "Review must be less than 500 characters" });
        }

        // Upsert review
        const existingReview = await reviewModel.findOne({ userId, foodId });
        
        if (existingReview) {
            existingReview.rating = rating;
            existingReview.review = review;
            await existingReview.save();
        } else {
            const newReview = new reviewModel({
                userId,
                foodId,
                rating,
                review
            });
            await newReview.save();
        }

        // Recalculate average rating
        const allReviews = await reviewModel.find({ foodId });
        const totalRatings = allReviews.length;
        const avgRating = totalRatings > 0 
            ? allReviews.reduce((sum, item) => sum + item.rating, 0) / totalRatings 
            : 0;

        // Update food model
        await foodmodel.findByIdAndUpdate(foodId, {
            averageRating: avgRating.toFixed(1),
            totalRatings: totalRatings
        });

        res.json({ success: true, message: "Review saved successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error saving review" });
    }
};

// Get all reviews for a food item
const getFoodReviews = async (req, res) => {
    try {
        const { foodId } = req.params;
        const reviews = await reviewModel.find({ foodId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

module.exports = { addReview, getFoodReviews };
