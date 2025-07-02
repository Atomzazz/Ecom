const express = require('express')
const router = express.Router()
const { listUsers, changeStatus, changeRole, emptyCart, getOrder, getUserCart, saveAddress, saveOrder, userCart } = require("../controllers/user")
const { authCheck, adminCheck } = require("../middlewares/authCheck")
router.get("/user", authCheck, adminCheck, listUsers)
router.post("/change-status", authCheck, adminCheck,changeStatus)
router.post("/change-role", authCheck, adminCheck,changeRole)

router.post("/user/cart", authCheck,userCart)
router.get("/user/cart", authCheck,getUserCart)
router.delete("/user/cart",authCheck, emptyCart)

router.post("/user/address", authCheck,saveAddress)

router.post("/user/order", authCheck,saveOrder)
router.get("/user/order", authCheck,getOrder)

authCheck,
module.exports = router