const prisma = require("../config/prisma")
const jwt = require('jsonwebtoken')

exports.authCheck =  async (req,res,next)=>{
    try {
        const headerToken = req.headers.authorization
        // console.log(headerToken)
        if(!headerToken){
            return res.status(401).json({message: "noToken"})
        }
        const token = headerToken.split(" ")[1]
        // console.log(token)

        const decode = jwt.verify(token,process.env.SECRET)
        req.user =decode

        const user = await prisma.user.findFirst({
            where:{
                email : req.user.email

            }

        })
        if(!user.enabled){
            return res.status(400).json({message: 'user cannot access'})
        }
  
        next()
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "sever error"})
        
    }
}


exports.adminCheck = async (req,res,next)=>{
    try {
       const {email} = req.user 
     
       const adminUser = await prisma.user.findFirst({
        where:{
            email
        }

       })
       if(!adminUser || adminUser.role !== "admin"){
        return res.status(403).json({ message :"Acess Admin Only!!"})
       }
       next()
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "error Admid access denied"})
        
    }
}