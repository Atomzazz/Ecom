const prisma = require("../config/prisma")
const { use } = require("../routes/user")
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)



exports.payment = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                orderById: req.user.id
            }
        })

        const amountTHB = cart.cartTotal *100
        


        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountTHB,
            currency: "thb",
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });




    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "server error" })
    }
}