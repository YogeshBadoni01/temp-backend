import { Comment } from "../models/comment.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { APIRessponse } from "../utils/ApiResponse.js";

const getVideoComment= asyncHandler( async( req,res) => {
    const { videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new APIError(200).json(new APIError(400,"video Id is not valid"))
    }

    const comment = await Comment.aggregate(
        [
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
        
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            }
        ]
    )

    if(comment.length<0){
        throw new APIError(500,"Something went wrong when while get comment")
    }

    return res.status(200).json(new APIRessponse(200,comment,"Comment get successfully"))

})

const addComment = asyncHandler( async(req,res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId){
        throw new APIError(400,"videoId is Invalid")
    }

    // const formValidation = [content]
   
    if(!content){
        throw new APIError(400,"Comment feild is empty")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new APIError(400,"Video is not exist")
    }

    // if()
    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id

    })

    if(!comment) {
        throw new APIError(500,"Something went wrong while create comment")
    }

    return res.status(201).json(new APIRessponse(201,comment,"Comment successfully created"))
})


const deleteComment = asyncHandler( async (req,res) => {
     const {commentId} = req.params

     if(!isValidObjectId(commentId)){
        throw new APIError(400,"Comment Id is Invalid")
     }

     const comment = await Comment.findById(commentId)
    //  console.log("comment",comment.owner    )
     
     if (!comment) {
        throw new APIError(400,"comment id not exist")
     }

     if (comment.owner.equals(req.user?._id)) {

     const comment = await Comment.findByIdAndDelete(commentId)
     console.log(comment)
     
    }
    else{
        throw new APIError(403,"Access Denied")
    }
     return res.status(200).json(new APIRessponse(200,comment,"Comment Successfully deleted"))
})

const updateComment = asyncHandler ( async (req,res) => {
    const {commentId} = req.params
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new APIError(400,"Comment Id is invalid")
    }
    if(!content){
        throw new APIError(400,"Content is empty")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new APIError(400,"Comment is not exist")
    }

    if(comment.owner.equals(req.user?._id)){

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:content 
            }
        },
        {new:true}
    )
    console.log(comment)
    
    }else{
        throw new APIError(403,"Access Denied")
    }
    
    return res.status(200).json( new APIRessponse(200,comment,"Successfully deleted comment"))
})




export {getVideoComment,addComment,deleteComment,updateComment}