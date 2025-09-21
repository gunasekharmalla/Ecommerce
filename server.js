const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const app = express()
const port = 5000 || process.env.PORT 
const AuthMiddleware = require("./middlewares/Auth")
const RoleAuthmiddleware = require("./middlewares/RoleAuth")
const routes = require("./routes/routes")
app.use(express.json())


const url = process.env.MONGO_URL
mongoose.connect(url,{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(()=>{
    console.log(" mongoDB connected")
}).catch(err=>{
    console.log("message",err.message)
})


app.use("/users",routes)


app.get("/admin", AuthMiddleware, RoleAuthmiddleware,(req,res)=>{
    res.send("welcome admin")
})

app.listen(port, ()=>{
    console.log(`server running on port http://localhost:${port}`)
}) 