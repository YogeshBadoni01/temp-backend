import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import util from 'util'

const  connectDB = async () =>{
    try {
        // const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URI2}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionIntance.connection.host}`);
        
        // console.log(`connectionIntance :\n ${connectionIntance.connection}`)
        // console.log(JSON.stringify(connectionIntance, null, 2));
        // console.log(util.inspect(connectionIntance,{showHidden:false,depth:true,colors:true})) // just for knowledge of connectionInstance, view
        
        
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED",error)
        process.exit(1)
    }
}

export default connectDB