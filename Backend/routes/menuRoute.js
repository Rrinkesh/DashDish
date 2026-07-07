const express = require('express');
const { addCategory, listCategory, removeCategory } = require('../controllers/menuController');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
});

const upload = multer({ storage: storage });

const { authmiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/add', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), upload.single("image"), addCategory);
router.get('/list', listCategory);
router.post('/remove', authmiddleware, authorizeRoles('OWNER', 'MANAGER'), removeCategory);

module.exports = router;
