import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const  connectDB = async () =>{
    try {
        const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        
        console.log(`\n ${connectionIntance.connection.host}`)
        console.log(`connectionIntance :\n ${connectionIntance.connection}`)

    } catch (error) {
        console.log("MONGODB CONNECTION FAILED",error)
        process.exit(1)
    }
}

export default connectDB