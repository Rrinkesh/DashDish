const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

module.exports = reviewModel;
