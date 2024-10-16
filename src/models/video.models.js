import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new Schema(
    {

        videoFile:{
            type:String,
            required:true, //cloudnary
        },
        thumbnail:{
            type:String,
            required:true //cloudnary
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0 //buy cloudnary
        },
        isPublished:{
            type:Boolean,
            default:true
        }
        
    }
)

// videoSchema.pre(mongooseAggregatePaginate)
videoSchema.plugin(mongooseAggregatePaginate)

    
export const Video = mongoose.model("Video",videoSchema)