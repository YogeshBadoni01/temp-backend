import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from '../models/tweets.models.js'
import { APIError } from "../utils/ApiError.js";
import { APIRessponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler( async(req,res) => {
    const content = req.body
   //  content=content.toString
   console.log(content.content)

     if(content.trim === ""){
        throw new APIError(400,"tweet content is empty")
     }

     const tweet = await Tweet.create(
      {
         content:content.content,
         owner:req.user?._id
      })

     if(!tweet){
      throw new APIError(500,"someting went wrong when creating tweet")
     }

     return res
     .status(200)
     .json(new APIRessponse(201,tweet,"tweet successfully created "))
    
})

const getUserTweet = asyncHandler( async(req,res) => {
   const getUserTweet = await Tweet.aggregate(
      [
         {
            $match:{
               owner:new mongoose.Types.ObjectId(req.user?._id)
            }
         },
         // {
         //    $lookup:{
         //       from:"users",
         //       localfield:"owner",
         //       foreignField:"_id",
         //       as:"owner",
         //       pipline:[
         //          {
         //             $project:{
         //                username:1,
         //                avatar:1
         //             }
         //          }
         //       ]
         //    }
         // }

      ]
   )
   if (!getUserTweet.length) {
      throw new APIError(400,"User does not exist")
   }
   return res.status(200)
   .json(new APIRessponse(200,getUserTweet,"User tweet successfully get"))
})



const updateTweet = asyncHandler( async(req,res) => {
   const {tweetId} = req.params
   const {content}=req.body

   if(!isValidObjectId(tweetId)){
      throw new APIError(400,"tweetId is not valid")
   }

   if(!content){
      throw new APIError(400,"content can not be empty or same")
   }

   const tweet = await Tweet.findById(tweetId)

   if(!tweet){
      throw new APIError("tweet is missing")
   }

   if(!(tweet.owner.equals(req.user?._id) )){
      return res.status(403).json(new APIError(403,"You don't have permission for update tweet","access denied."))
   }

   const updateTweet= await Tweet.findByIdAndUpdate(
      tweetId,
      {
         $set:{
            content:content
         }
      },
      {new :true}
   )

   if(!updateTweet){
      throw new APIError(500,"Something went while updating tweet")
   }
   
   return res.status(200).json(new APIRessponse(200,updateTweet,"Tweet is successfully updated"))
})

const deleteTweet = asyncHandler(async(req,res) => {
   const {tweetId} = req.params

   // try {
      if(!isValidObjectId(tweetId)){
         throw new APIError(400,"tweetId is not valid")
      }
   
      const tweet = await Tweet.findById(tweetId)
      console.log("tweet",tweet)
      if(!tweet){
         throw new APIError(400,"tweet is missing")
      }
      
      if(tweet.owner.equals(req.user?._id) ){
         var deletedTweet = await Tweet.deleteOne({_id:tweetId})
         if(!deletedTweet){
            throw new APIError(500,"Something went wrong while deleting")
         }
      }
      else{
         return res.status(403).json(new APIError(403,"You don't have permission for delete tweet","access denied."))
      }

   // } 
   
   // console.log("deleteTweet",deleteTweet)

   return res
   .status(200)
   .json(new APIRessponse(200,deleteTweet,"Successfully tweet delete    "))
})

export {createTweet,getUserTweet,updateTweet,deleteTweet}