const mongoose =require('mongoose')

const foodschema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
    required:true},
    category:{
        type:String,
        required:true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    ingredients: [{
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'inventory'
        },
        quantityRequired: {
            type: Number,
            required: true
        }
    }]
})

const foodmodel = mongoose.models.food || mongoose.model("food",foodschema);

module.exports =foodmodel;
