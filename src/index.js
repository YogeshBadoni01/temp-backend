import dotenv from 'dotenv'
import mongoos from 'mongoose'
import connectDB from './db/index.js'
dotenv.config({path:'./env'})
connectDB()

/*
this is for learning purpose
import { DB_NAME } from './constant';
import express from 'express'
const app = express()
;(async ()=>{
    try {
       await mongoos.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("ERROR",(error) =>{
            console.log("ERROR",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log("server is running on port no",port)
        })
    } catch (error) {
        console.log("ERROR",error)
        throw error
    }
})()
*/