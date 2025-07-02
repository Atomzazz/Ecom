const express = require('express')

const router = express.Router()
const { create, list, remove, listBy, search, update, read, images, removeImages } = require("../controllers/product")

const { authCheck, adminCheck } = require('../middlewares/authCheck')
router.post('/product', create)
router.get('/products/:count', list)
router.get('/product/:id', read)
router.put('/product/:id', update)
router.delete('/product/:id', remove)
router.post('/productby', listBy)
router.post('/search/filters', search)


router.post('/images', authCheck, adminCheck, images)
router.post('/removeimage', authCheck, adminCheck, removeImages)


module.exports = router