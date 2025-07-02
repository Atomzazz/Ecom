const prisma = require("../config/prisma")
const { use } = require("../routes/user")

exports.listUsers = async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true
            }
        })
        res.send(user)
    } catch (err) {
        console.log(err)
        res.status()
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) }, data: { enabled }
        })
        console.log(id, enabled)
        res.send(user.enabled)

    } catch (err) {
        console.log(err)
        res.status()
    }
}

exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) }, data: { role }
        })
        res.send(`update changeRole!  ${user.role}`)


    } catch (err) {
        console.log(err)
        res.status()
    }
}

exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body
        console.log(cart)
        console.log(req.user.id)
        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) }
        })
        // console.log(user)

        //  check Quantity
        for (const item of cart) {
            const product = await prisma.product.findUnique({
                where: { id: item.id },
                select: {
                    quantity: true,
                    title: true
                }
            })
            if (!product || item.count > product.quantity) {
                return res.status(400).json({ ok: false, message: `ขออภัย ${product?.title || 'product'} สินค้าหมด. ` })
            }


            console.log(item)
            console.log(product)
        }

        //delete old cart 
        await prisma.productOnCart.deleteMany({
            where: {
                cart: {
                    orderById: user.id
                },
            }
        })

        //delete old cart
        await prisma.cart.deleteMany({
            where: {
                orderById: user.id

            }

        })


        let products = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))


        //หาผลรอมสินค้า accumulatorค่าที่สะสมไว้  = sum , currentValuค่าปัจจุบัน=item , initialValueค่าเริ่มต้น = 0
        let cartTotal = products.reduce((sum, item) =>
            sum + item.price * item.count, 0)



        //new cart 
        const newCart = await prisma.cart.create({
            data: {
                products: {
                    create: products
                },
                cartTotal,
                orderById: user.id
            }
        })
        console.log(cartTotal)



        res.send('hello userCart!')

    } catch (err) {
        console.log(err)
        res.status()
    }
}

// exports.getUserCart = async (req, res) => {
//     try {
//         const cart = await prisma.cart.findFirst({
//             where: {
//                 orderById: Number(req.user.id)
//             }, include: {
//                 products: {
//                     include: {
//                         product: true
//                     }
//                 }
//             }
//         })
//         console.log(cart)
//         res.json({
//             products: cart.products,
//             cart: cart.cartTotal
//         })

//     } catch (err) {
//         console.log(err)
//         res.status()
//     }
// }



exports.getUserCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id),
            },
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // ✅ ถ้ายังไม่มี cart ให้ส่งค่าเริ่มต้น
        if (!cart) {
            return res.status(200).json({
                products: [],
                cart: 0,
            });
        }

        // ✅ ถ้ามี cart ส่งกลับตามปกติ
        res.status(200).json({
            products: cart.products,
            cart: cart.cartTotal,
        });
    } catch (err) {
        console.error('❌ getUserCart error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.emptyCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { orderById: Number(req.user.id) }
        })
        if (!cart) {
            return res.status(400).json({ message: "No cart" })
        }
        await prisma.productOnCart.deleteMany({
            where: { cartId: cart.id }
        })

        const result = await prisma.cart.deleteMany({
            where: {
                orderById: Number(req.user.id)
            }
        })
        res.json({
            message: "Cart Empty Success",
            deleteCount: result.count
        })

    } catch (err) {
        console.log(err)
        res.status()
    }
}

exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body
        console.log(address)

        const addressUser = await prisma.user.update({
            where: {
                id: Number(req.user.id)
            }, data: {
                address
            }
        })
        res.send(' updatr Address!')

    } catch (err) {
        console.log(err)
        res.status()
    }
}

exports.saveOrder = async (req, res) => {
    try {

        // console.log(req.body);
        // return res.send("hello!!!!")


        const { id, amount, status, currency } = req.body.paymentIntent


        const userCart = await prisma.cart.findFirst({
            where: {
                orderById: Number(req.user.id)
            }, include: {
                products: true
            }
        })

        //check Empty
        if (!userCart || userCart.products.length === 0) {
            return res.status(400).json({ ok: false, message: ("cart is Empty") })
        }


        const amountTHB = Number(amount) / 100
        //create new order
        const order = await prisma.order.create({
            data: {
                products: {
                    create: userCart.products.map((item) => ({
                        productId: item.productId,
                        count: item.count,
                        price: item.price,

                    }))

                },
                orderBy: {
                    connect: { id: req.user.id }
                },
                cartTotal: userCart.cartTotal,
                stripePaymentId: id,
                amount: Number(amount),
                status: status,
                currency: currency,


            }
        })
        console.log(order)

        const update = userCart.products.map((item) => ({
            where: {
                id: item.productId
            },
            data: {
                quantity: { decrement: item.count }, //decrement=ลบ
                sold: { increment: item.count }// increment = บวก
            }
        }))
        
        await Promise.all(update.map((updated) => {
            return prisma.product.update(updated) // ✅ ต้องมี return
        }))

        await prisma.cart.deleteMany({
            where: {
                orderById: Number(req.user.id)
            }
        })

        res.json({ ok: true, order })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "error" })
    }
}

exports.getOrder = async (req, res) => {
    try {
        const order = await prisma.order.findMany({
            where: {
                orderById: Number(req.user.id)
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                },
                orderBy: true // ✅ เพิ่มตรงนี้เพื่อดึงข้อมูลผู้สั่ง เช่น username, email
            }
        });

        if (order.length === 0) {
            return res.status(400).json({ ok: false, message: "no order" });
        }

        res.json({ ok: true, order });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "error order" });
    }
};





