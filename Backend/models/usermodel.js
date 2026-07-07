const mongoose =require('mongoose');
const userschema =new mongoose.Schema({
    name:{type:String,
        required:true,

    },
    email:{type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        },
    phone: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    address: {
        type: Object,
        default: {}
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    cartdata: { type: Object, default: {} },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'KITCHEN', 'DELIVERY', 'CUSTOMER', 'admin', 'user'], // kept admin/user for backwards compatibility
        default: 'CUSTOMER'
    },
    profileImage: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
},
{minimize:false}
)

const usermodel = mongoose.models.user || mongoose.model('user',userschema)
module.exports=usermodel;