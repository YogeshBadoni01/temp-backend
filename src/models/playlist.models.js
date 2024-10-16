import mongoose from 'mongoose'
const playlistSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        video:[
            {
                type:mongoose.Types.ObjectId,
                ref:"Video"
            }
        ],
        owner:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        }     
    },{timestamps:true}
) 

export const Playlist =  new mongoose.model("Playlist",playlistSchema)