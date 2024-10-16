import mongoose from "mongoose";


const likeSchema =  new mongoose.Schema(
    {
        video:{
            type:mongoose.Types.ObjectId,
            ref:"Video"
        },
        comment:{
            type:mongoose.Types.ObjectId,
            ref:"comment"
        },
        tweet:{
            type:mongoose.Types.ObjectId,
            ref:"tweet"
        },
        likedBy:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true}
)

export const Like = new mongoose.model("Like",likeSchema)
