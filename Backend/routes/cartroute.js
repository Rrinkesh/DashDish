const express= require("express");
const { addtocart,removefromcart,getcart } =require("../controllers/cartcontroller.js");
const {authmiddleware} = require("../middleware/auth.js");

const cartrouter=express.Router();
console.log("authmiddleware:", authmiddleware);
console.log("addtocart:", addtocart);
console.log("removefromcart:", removefromcart);
console.log("getcart:", getcart);


cartrouter.post("/add",authmiddleware,addtocart);
cartrouter.post("/remove",authmiddleware,removefromcart);
cartrouter.post("/get",authmiddleware,getcart);

module.exports= cartrouter;