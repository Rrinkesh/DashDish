const jwt = require("jsonwebtoken");
const usermodel = require('../models/usermodel');

const authmiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "not authorize login again" })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!req.body) req.body = {};
        req.body.userid = token_decode.id;
        
        // Fetch full user and attach to req.user for role-based access control
        const user = await usermodel.findById(token_decode.id);
        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "error" });
    }
}
module.exports = { authmiddleware };