const usermodel = require("../models/usermodel");

//add items to usercart...
const addtocart=async(req,res)=>{
 try{
let userdata=await usermodel.findOne({_id:req.body.userid});
if (!userdata.cartdata) userdata.cartdata = {};
let cartdata = userdata.cartdata;

if(!cartdata[req.body.itemid]){
    cartdata[req.body.itemid]=1;
}
else{
    cartdata[req.body.itemid]+=1;
}
await usermodel.findByIdAndUpdate(req.body.userid,{cartdata});
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
        let userdata=await usermodel.findById(req.body.userid);
        let cartdata=await userdata.cartdata;
        if(cartdata[req.body.itemid]>0){
            cartdata[req.body.itemid]-=1;
        }
        await usermodel.findByIdAndUpdate(req.body.userid,{cartdata});
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
        let userdata=await usermodel.findById(req.body.userid);
        let cartdata=await userdata.cartdata;
        res.json({success:true,cartdata})
    }
    catch(error){
 console.log(error);
 res.json({success:fasle,message:"error"})
    }
}

module.exports= {addtocart,removefromcart,getcart}

