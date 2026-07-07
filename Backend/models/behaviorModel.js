const mongoose = require('mongoose');

const behaviorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false // Allow anonymous tracking via session/device id if needed later
    },
    action: {
        type: String,
        enum: ['VIEW', 'ADD_TO_CART', 'SEARCH'],
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: false
    },
    metadata: {
        type: Object, // e.g. search term
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Automatically delete after 7 days (TTL index)
    }
});

const behaviorModel = mongoose.models.behavior || mongoose.model('behavior', behaviorSchema);
module.exports = behaviorModel;
