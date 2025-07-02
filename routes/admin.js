const express = require("express")
const { authCheck } = require("../middlewares/authCheck")
const router = express.Router()
const {changeOrderStatus , getOrderAdmin } =require("../controllers/admin")
router.put('/user/order-status', authCheck,changeOrderStatus)
router.get('/admin/order', authCheck,getOrderAdmin)



module.exports = router