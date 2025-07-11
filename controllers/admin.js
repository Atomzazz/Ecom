const prisma = require("../config/prisma")

exports.changeOrderStatus = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body
        const orderUpdate = await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus }

        })
        res.json(orderUpdate)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "error changeOrderStatus" })
    }
}


exports.getOrderAdmin = async (req, res) => {
    try {
        const orders =await prisma.order.findMany({
            include:{
                products:{
                    include:{
                        product:true
                    }
                },
                orderBy:{
                    select:{
                        id:true,
                        email:true,
                        address:true
                    }
                }
            }
        })
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "error getOrderAdmin" })
    }
}