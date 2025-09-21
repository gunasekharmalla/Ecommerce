const express = require("express")  
const jwt = require("jsonwebtoken")

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers["authorization"]
    if (!authHeader) return res.status(401).json({message:"no authorization"})

    const token = authHeader && authHeader.split(" ")[1]
    if(!token) return res.status(401).json({message:"token not valid"})
        
    try{
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
           req.user = decoded;
           next();
       }catch(err){
           res.status(401).json({message: "Token is not valid"})
       }
}

module.exports = authMiddleware;