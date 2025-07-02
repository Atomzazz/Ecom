const express = require("express")
const { authCheck } = require("../middlewares/authCheck")
const {
    getHomeImages,
    createHomeImage,
    deleteHomeImage,
    updateHomeImage,
    getHomeImageById,
    toggleFeaturedImage
  
} = require("../controllers/homepage")

const router = express.Router()

// GET: ดึงรูปทั้งหมด
router.get('/home-images', getHomeImages)

// POST: เพิ่มรูปใหม่ (ต้อง login)
router.post('/home-images', authCheck, createHomeImage)

// DELETE: ลบรูปตาม id (ต้อง login)
router.delete('/home-images/:id', authCheck, deleteHomeImage)

// PUT: แก้ไข title หรือ image_url (ต้อง login)
router.put('/home-images/:id', authCheck, updateHomeImage)
router.patch('/home-images/:id/toggle-featured', authCheck, toggleFeaturedImage);


router.get('/home-images/:id', getHomeImageById);

module.exports = router


