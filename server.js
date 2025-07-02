const express = require('express')
const app = express()
const morgan = require('morgan')
// const authRouter = require ('./routes/auth')
// const categoryRouter = require('./routes/category')
const { readdirSync } = require('fs')
const cors = require('cors')

//middleware
app.use(morgan('dev'))
app.use(express.json({limit:'20mb'}))
app.use(cors())
// app.use('/api',authRouter)
// app.use('/api',categoryRouter)



readdirSync('./routes').map((item) => {
    app.use('/api', require('./routes/' + item))
})
//Router 
// app.get ('/api',(req,res)=>{
//     console.log(req.body)
//     res.send("aaaa")
// })



app.listen(5001, () => {
    console.log('Server is running on port 5001')
})