const usermodel = require("../models/usermodel");

//add items to usercart...
const addtocart=async(req,res)=>{
 try{
const userId = req.body?.userid || req.user?._id || req.headers?.userid;
if (!userId || !req.body?.itemid) {
    return res.json({ success:false, message:"Invalid cart request" });
}
let userdata=await usermodel.findOne({_id:userId});
if (!userdata) {
    return res.json({ success:false, message:"User not found" });
}
if (!userdata.cartdata) userdata.cartdata = {};
let cartdata = userdata.cartdata;

if(!cartdata[req.body.itemid]){
    cartdata[req.body.itemid]=1;
}
else{
    cartdata[req.body.itemid]+=1;
}
await usermodel.findByIdAndUpdate(userId,{cartdata});
res.json({success:true,message:"Added to cart"});
 }
 catch(error){
console.log(error);
res.json({success:false,message:"error"})
}
}
//remove items from usercart...
const removefromcart =async(req,res)=>{
    try {
        const userId = req.body?.userid || req.user?._id || req.headers?.userid;
        if (!userId || !req.body?.itemid) {
            return res.json({ success:false, message:"Invalid cart request" });
        }
        let userdata=await usermodel.findById(userId);
        if (!userdata) {
            return res.json({ success:false, message:"User not found" });
        }
        let cartdata=userdata.cartdata || {};
        if(cartdata[req.body.itemid] > 0){
            cartdata[req.body.itemid]-=1;
        }
        await usermodel.findByIdAndUpdate(userId,{cartdata});
        res.json({
            success:true,
            message:"remove from cart"
        })
    } catch (error) {
        console.log(error);
        res.json({success:false,
            message:"error"
        })
    }
}

//fetch user cart data...
const getcart =async(req,res)=>{
    try{
        const userId = req.body?.userid || req.user?._id || req.headers?.userid;
        if (!userId) {
            return res.json({success:false,message:"Invalid cart request"});
        }
        let userdata=await usermodel.findById(userId);
        if (!userdata) {
            return res.json({success:false,message:"User not found"});
        }
        let cartdata=userdata.cartdata || {};
        res.json({success:true,cartdata})
    }
    catch(error){
 console.log(error);
 res.json({success:false,message:"error"})
    }
}

module.exports= {addtocart,removefromcart,getcart}

