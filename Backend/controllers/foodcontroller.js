const { response } = require("express");
const foodmodel = require("../models/foodmodel");
const fs =require('fs')
//add food item...
const addfood= async(req,res)=>{
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Image is required"
        });
    }
let image_filename =`${req.file.filename}`;
    let parsedIngredients = [];
    if (req.body.ingredients) {
        try {
            parsedIngredients = JSON.parse(req.body.ingredients);
        } catch (e) {
            console.error("Error parsing ingredients", e);
        }
    }

const food =new foodmodel({
    name:req.body.name,
    description:req.body.description,
    price:req.body.price,
    category:req.body.category,
    image:image_filename,
    ingredients: parsedIngredients
})
try{
await food.save();
res.json({success:true,
    message:"succefully food added"
})
}catch (error) {
    console.log(error);   // 🔥 ye line add karo
    res.status(500).json({
        success: false,
        message: error.message
    });
}

}
// all food list...
const foodlist =async (req,res)=>{
           try{
            const foods=await foodmodel.find({});
            res.json({success:true,
                data:foods
            })
           }
           catch(error){
            console.log(error);
            res.json({success:false,
                message:"error"
            })
           }
}



//remove food item...
const removefood =async(req,res)=>{
try {
    const food =await foodmodel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`,()=>{})
    await foodmodel.findByIdAndDelete(req.body.id);
    res.json({success:true,
        message:"successfull delete"
    })
} catch (error) {
    console.log(error);
    res.json({success:false,
        message:"error"
    })
}
}



// get single food item
const getFoodById = async (req, res) => {
    try {
        const food = await foodmodel.findById(req.params.id);
        if (!food) {
            return res.json({ success: false, message: "Food item not found" });
        }
        res.json({ success: true, data: food });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching food item" });
    }
}


module.exports= {addfood,foodlist,removefood,getFoodById}