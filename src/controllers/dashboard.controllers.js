import { asyncHandler } from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js"
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { APIRessponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async(req,res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    
    //total video views
    const videos = await Video.find(
        {owner:req.user?._id}

    ).exec()

    // console.log("videos",videos)
    let totalSum = 0;

     videos.forEach((sum) =>  {
        totalSum += sum.views;
    });
    // console.log("views",totalSum)



    // const subscribers = await Subscription.aggregate(
    //     [
    //         {
    //             $lookup:{
    //                 from:"users",
    //                 localField:"subscriber",
    //                 foreignField:"_id",
    //                 as:"Subscribers",
    //                 pipeline:[
    //                     {
    //                       $lookup:{
    //                         from:"Subscriptions",
    //                         localField:"_id",
    //                         foreignField:"channel",
    //                         as:"SubsriberToScriber"
    //                       }  
    //                     }
    //                 ]
    //             }
    //         },
    //         {
    //             $addFields:{
    //                 subsriberCount:{
    //                     $size:"$SubsriberToScriber"
    //                 }
    //             }
    //         },
    //         {
    //             $project:{
    //                 subsriberCount:1
    //             }
    //         }

    //     ]
    // )
    const subsriber = await Subscription.find(
        {channel:req.user?._id}
    )

    let totalSubriber=0
    subsriber.forEach((s) => {
        totalSubriber =s.subsriber
    })

    console.log("totalSubriber",totalSubriber)


    const totalSubscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group:{
                _id:null,
                subscribersCount:{
                    $sum:1
                }
            }
        },
        {
            $project:{
             subsriber   
            }
        }
    ]);


    console.log("subscribers",totalSubscribers)
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await Video.find(
        {owner:req.user?._id}
    )

    return res 
            .status(200)
            .json(new APIRessponse(200,videos,"successfully get all videos"))

})

export {getChannelStats,getChannelVideos}