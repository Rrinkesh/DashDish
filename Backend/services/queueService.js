const ordermodel = require('../models/ordermodel');

// Average preparation time per order in minutes
const AVG_PREP_TIME_MINS = 4;

const calculateETA = async (currentOrderId) => {
    try {
        // Find all orders that are currently pending or preparing, ordered by creation date
        const activeOrders = await ordermodel.find({
            status: { $in: ["food processing...", "Pending", "Accepted", "Preparing"] }
        }).sort({ date: 1 });

        let queuePosition = 0;
        let found = false;

        for (let i = 0; i < activeOrders.length; i++) {
            if (activeOrders[i]._id.toString() === currentOrderId.toString()) {
                queuePosition = i; // Number of orders ahead of this one
                found = true;
                break;
            }
        }

        if (!found) {
            // Order is either ready, completed, or doesn't exist
            return { ordersAhead: 0, estimatedMins: 0, queuePosition: 0 };
        }

        const estimatedMins = (queuePosition + 1) * AVG_PREP_TIME_MINS;
        
        return {
            ordersAhead: queuePosition,
            estimatedMins: estimatedMins,
            queuePosition: queuePosition + 1
        };

    } catch (error) {
        console.error("Queue calculation error:", error);
        return { ordersAhead: 0, estimatedMins: 0, queuePosition: 0 };
    }
}

module.exports = { calculateETA, AVG_PREP_TIME_MINS };
