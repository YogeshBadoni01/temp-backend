import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import {Subscription} from '../models/subscription.model.js'
import {APIRessponse} from '../utils/ApiResponse.js'


const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel : channelId
    })

    if (isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed?._id)

        return res
        .status(200)
        .json(
            new APIRessponse(
                200,
                {subscribed : false},
                "Unsubscribed successfully"
            )
        )
    }

    await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId
    })

    return res.status(200)
    .json(new APIRessponse(200,{subscribed:true},"Subscribed successfully"))
})

const getUserChannelSubscriber = asyncHandler(async(req,res)=>{
    let {channelId} = req.params;
    channelId = new mongoose.Types.ObjectId(channelId)

    console.log(await Subscription.findById(channelId))
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:channelId,
            },
        },
        {
            $lookup:{
                from:"users",
                localField: "subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribedToSubscriber",
                        }
                    },
                    {
                        $addFields:{
                            subscribedToSubscriber:{
                                $cond:{
                                    if :{
                                        $in:[
                                            channelId,
                                            "$subscribedToSubscriber.subscriber"
                                        ]
                                    },
                                    then: true,
                                    else : false
                                }
                            },
                            subscribersCount : {
                                $cond: {
                                    if: { $isArray: "$subscribedTo" }, 
                                    then: { $size: "$subscribedTo" }, 
                                    else: 0
                               }
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$subscriber",
        },
        {
            $project:{
                _id:0,
                subscriber:{
                    _id: 1,
                    username : 1,
                    fullName : 1,
                    "avatar.url":1,
                    subscribedToSubscriber:1,
                    subscribersCount:1
                }
            }
        }
    ])
    return res.status(200)
    .json(new APIRessponse(200,subscribers,"Subscribers fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params;
    
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                        },
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1
                    },
                },
            },
        },
    ]);
    return res.status(200)
    .json(
        new APIRessponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})


export {
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
}