import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({
    content:{
        type:String,
        required:true,
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

tweetSchema.plugin(mongooseAggregatePaginate)
export const Tweet = new mongoose.model("Tweet",tweetSchema)