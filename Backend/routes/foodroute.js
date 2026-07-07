const express =require('express');
const { addfood, foodlist, removefood, getFoodById } = require('../controllers/foodcontroller');
const multer =require('multer');
const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router =express.Router();
// image storage engine...
const storage =multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload =multer({storage:storage})

// Only OWNER and MANAGER can add/remove food
router.post('/add', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), upload.single("image"), addfood)
router.post("/remove", authmiddleware, authorizeRoles('OWNER', 'MANAGER'), removefood)

// Anyone can list food (used by customer app too)
router.get('/list', foodlist)
router.get("/:id", getFoodById);

module.exports = router;