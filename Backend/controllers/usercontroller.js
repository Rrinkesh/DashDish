const usermodel =require('../models/usermodel');
const jwt =require('jsonwebtoken')
const bcrypt =require('bcrypt');
const validator =require('validator');
const { sendOtpEmail } = require('../services/emailService');

//login user...
const loginuser =async (req,res)=>{
       const {email,password}=req.body;
       try{
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    let user = await usermodel.findOne({email: normalizedEmail})

    if(!user && normalizedEmail === adminEmail && password === adminPassword){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        user = await usermodel.create({
            name:'Admin',
            email: normalizedEmail,
            password: hashedPassword,
            phone: '0000000000',
            isVerified: true,
            role:'SUPER_ADMIN' // Using standard role
        });
    }

    if(!user){
        return res.json({success:false,message:"user does not exist"})
    }
    const ismatch=await bcrypt.compare(password,user.password);
    if(!ismatch){
        return res.json({success:false,message:"invalid credentials"})}
    
    // Auto-verify staff/admin roles if they are not yet verified
    if (user.role && user.role !== 'CUSTOMER' && user.isVerified === false) {
        user.isVerified = true;
        await user.save();
    }

    if (user.isVerified === false) {
        return res.json({success: false, message: "User is not verified. Please complete verification."});
    }

    // End self-healing

    const token =createtoken(user._id);
     return res.json({
      success: true,
      token: token,
      role: user.role || 'CUSTOMER',
      isAdmin: user.role === 'admin' || user.role === 'SUPER_ADMIN' || user.role === 'OWNER' || user.role === 'MANAGER'
    });
    }catch(error){
       console.log(error);
       res.json({success:false,
        message:"error"
       })
       }
}

const createtoken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET);
}
//signup user...
const registeruser =async(req,res)=>{
const {name,password,email,phone}=req.body;
let emailResult = { success: false, message: "OTP created successfully. Email delivery is currently unavailable; please contact support if you do not receive it." };
try{
const exists =await usermodel.findOne({email});
if(exists){
    return res.json({
        success:false,
        message:"user already exists"
    })  
}
if(!validator.isEmail(email)){
    return res.json({success:false,
        message:"plz enter valid email"})
}
if(password.length<8){
    return res.json({success:false,
        message:"plz enter the strong password"})
}
if(!phone){
    return res.json({success:false, message:"phone number is required"})
}
//hashing user password...
const salt =await bcrypt.genSalt(10);
const hashedpasswrd=await bcrypt.hash(password,salt);

// Generate a 6-digit OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

const newuser = new usermodel({
    name:name,email:email,password:hashedpasswrd, phone:phone,
    otp: otp, otpExpires: otpExpires, isVerified: false
})

const user =await newuser.save();

// Sending OTP
console.log(`[MOCK EMAIL & SMS] Sending OTP ${otp} to email: ${email} and phone: ${phone}`);

try {
    // Send Email
    const emailResult = await sendOtpEmail({ to: email, otp });
    if (emailResult.success) {
        console.log("OTP sent via email");
    } else {
        console.warn("Email delivery failed:", emailResult.message);
    }

} catch (sendError) {
    console.error("Error sending OTP via email:", sendError);
    // Even if sending fails (e.g. invalid phone number), we might still want to proceed or return an error. 
    // We will proceed for now so they aren't blocked entirely.
}

res.json({success:true,
    message: emailResult?.success ? "OTP sent to your email" : "OTP created successfully. Email delivery is currently unavailable; please contact support if you do not receive it.",
    otpRequired: true
})

}catch(error){
    console.log(error);
    res.json({
        success:false,
        message:"error"
    })
}
}

// verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.isVerified) {
            return res.json({ success: false, message: "User is already verified" });
        }
        if (user.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (user.otpExpires < new Date()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = createtoken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "error" });
    }
}

// get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await usermodel.findById(req.body.userid).select('-password');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching profile" });
    }
}

module.exports ={loginuser,registeruser,verifyOtp,getUserProfile};