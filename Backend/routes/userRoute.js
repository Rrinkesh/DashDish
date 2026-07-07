const express =require('express');
const { registeruser, loginuser, verifyOtp, getUserProfile } = require('../controllers/usercontroller');
const { authmiddleware } = require('../middleware/auth');
const userrouter =express.Router();
userrouter.post('/register',registeruser);
userrouter.post('/login',loginuser)
userrouter.post('/verify-otp',verifyOtp);
userrouter.post('/profile', authmiddleware, getUserProfile);


module.exports={userrouter}
