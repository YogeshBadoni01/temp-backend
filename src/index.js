import dotenv from 'dotenv'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({path:'./env'})

const port = process.env.PORT || 8000

connectDB()
.then(() => {
    app.listen(port,()=>{
        console.log("⚙️DBCONNECT successfully connect",port)
    })
    // app.on("error",(error) => {
        //     console.log("Database ERROR ",error)
        //     throw error
        // })
    })
    .catch((error) => {
        console.log("MONGO is failed to connect"+error)
    })
    /*
    // this is for learning purpose
    import { DB_NAME } from './constant.js';
    import express from 'express'
    import mongoos from 'mongoose'
const app = express()
;(async ()=>{
    try {
       await mongoos.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("ERROR",(error) =>{
            console.log("ERROR",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log("server is running on port no",process.env.PORT)
        })
    } catch (error) {
        console.log("ERROR",error)
        throw error
    }
})()
*/