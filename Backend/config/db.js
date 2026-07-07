const mongoose =require('mongoose')


const connectdb= async()=>{
    await mongoose.connect('mongodb://127.0.0.1:27017/food_del').then(()=>{console.log("db connected")})
}


module.exports ={connectdb}

