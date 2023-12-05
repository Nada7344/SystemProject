const e = require("express");
const express =require ("express");
const app=express();
const mongoose=require("mongoose");

mongoose
.connect('mongodb://127.0.0.1:27017/OurUsers')
.then(() => {console.log('connected to MongoDB')})  
.catch((error) => {console.log('faild connect to mongodb'+error)})










app.listen(3000,()=>{console.log(" server runing on port 3000")})

