const mongoose =require("mongoose");

const orderschema =new mongoose.Schema({
        userid:{
        type:String,
        required:true,},
        
        items:{type:Array,required:true},
        amount:{type:Number,required:true},
        address:{type:Object,required:false}, // Not required for Pickup/Dine-In
        status:{type:String,default:"Pending"},
        date:{type:Date,default:Date.now()},
        payment:{type:Boolean,default:false},
        
        // Multi-Order System Fields
        orderType: { type: String, enum: ['DELIVERY', 'PICKUP', 'DINE_IN'], default: 'DELIVERY' },
        tableNumber: { type: String, default: null },
        pickupToken: { type: String, default: null },
        pickupTime: { type: String, default: null },
        deliveryInstructions: { type: String, default: "" },
        estimatedReadyTime: { type: Date, default: null },

        // Delivery Management Fields (Phase 3)
        deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryPartner', default: null },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
        assignedAt: { type: Date, default: null },
        deliveryStatus: { type: String, enum: ['Pending', 'Waiting For Assignment', 'Driver Assigned', 'Driver Accepted', 'Driver Rejected', 'Picked Up', 'On The Way', 'Nearby', 'Delivered', 'Completed', 'Cancelled'], default: 'Pending' },
        
        // Tracking Fields (Phase 3B)
        driverCurrentLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null }
        },
        estimatedArrival: { type: Date, default: null },
        remainingDistance: { type: String, default: null },
        deliveryStartedAt: { type: Date, default: null },
        lastLocationUpdate: { type: Date, default: null },

        // Delivery Completion (Phase 3C)
        deliveryOTP: { type: String, default: null },
        otpExpiresAt: { type: Date, default: null },
        otpVerified: { type: Boolean, default: false },
        deliveryCompletedAt: { type: Date, default: null },
        deliveryProof: { type: String, default: null },
        driverRating: { type: Number, default: null },
        driverReview: { type: String, default: null },
        invoiceId: { type: String, default: null },

        deliveryStartTime: { type: Date, default: null },
        deliveryCompletedTime: { type: Date, default: null },
        otp: { type: String, default: null },
        otpVerified: { type: Boolean, default: false },
        proofImage: { type: String, default: null },
        driverCurrentLocation: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 }
        },
        estimatedArrival: { type: Date, default: null },
        paymentMethod: { type: String, enum: ['Card', 'UPI', 'NetBanking', 'Wallet', 'COD', 'PayAtPickup', 'PayAtRestaurant', 'Stripe', 'Razorpay'], default: 'Stripe' },
        paymentStatus: { type: String, enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Refunded', 'Cancelled', 'Partially Refunded'], default: 'Pending' },
        paymentId: { type: String, default: null }, // Gateway specific payment ID
        transactionId: { type: String, default: null },
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'invoice', default: null },
        couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'coupon', default: null },
        discountAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        packingFee: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 }
    
})

const ordermodel = mongoose.models.order || mongoose.model("order",orderschema);

module.exports =ordermodel;