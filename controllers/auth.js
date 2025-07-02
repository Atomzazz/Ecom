const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const { json } = require('express')
const jwt = require('jsonwebtoken')



exports.register = async (req, res) => {
    try {
        const { email, password } = req.body
        //validate
        if (!email) {
            return res.status(400).json({ message: "email is required!!" })
        }
        if (!password) {
            return res.status(400).json({ message: "password is required!!" })
        }

        //check have email already
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (user) {
            return res.status(400).json({ message: "Email already" })
        }

        //password
        const hashPassword = await bcrypt.hash(password, 10)
        console.log(hashPassword)

        await prisma.user.create({
            data: {
                email: email,
                password: hashPassword,

            }
        })
        res.send("Register Success")

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever Error" })
    }


}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        //check email
        const user = await prisma.user.findFirst({
            where: {
                email: email

            }
        })
        if (!user || !user.enabled) {
            return res.status(400).json({ message: "User Not found or not Enabled" })
        }

        //check password
        const userPassword = await bcrypt.compare(password, user.password)
        if (!userPassword) {
            return res.status(400).json({ message: "Password Invalid!!!" })
        }

        //payload 
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name:user.name
        }
        //generate token
        jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' },
            (err, token) => {
                if (err) {
                    return res.status(500), json({ message: "Sever Error" })
                }
                res.json({ payload, token })
            })
        console.log(payload)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever Error" })
    }


}

exports.currentUser = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where:{email:req.user.email},
            select:{
                id:true,
                email:true,
                name:true,
                role:true
            }
        })
        res.json({user})

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever Error" })
    }
}

