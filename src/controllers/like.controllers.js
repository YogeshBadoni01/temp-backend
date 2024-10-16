import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";
import { Tweet } from "../models/tweets.models.js";
import { Comment } from "../models/comment.models.js";
import { APIRessponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "VideoId is invalid");
  }

  const video = await Video.findById(videoId);

  const islike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if(!video){
    throw new APIError(400,"video is not exist")
  }
  // //   if like *or not* by User then deslike *or like*
  try {
    if ( islike) {
      const deleteLike = await Like.findByIdAndDelete(islike?._id);
      return res
        .status(200)
        .json(new APIRessponse(200, deleteLike, "Video disLike successfully"));
    } else {
      const LikedVideo = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
      });
      return res
        .status(200)
        .json(new APIRessponse(200, LikedVideo, "video liked successfully"));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong in update like"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new APIError(400, "comment Id is invalid");
  }

  const comment = await Comment.findById(commentId);
  const islike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if(!comment){
    throw new APIError(400,"comment is not exist")
  }

  if ( islike) {
    const disLikeComment = await Like.findByIdAndDelete(islike?._id);
    return res
      .status(200)
      .json(
        new APIRessponse(200, disLikeComment, "comment disLike successfully")
      );
  } else {
    const likeComment = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new APIRessponse(200, likeComment, "comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new APIError(400, "tweet Id is invalid");
  }

  const tweet = await Tweet.findById(tweetId);
  const islike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if(!tweet){
    throw new APIError(400,"tweet is not exist")
  }
  if ( islike) {
    const disLiketweet = await Like.findByIdAndDelete(islike?._id);
    return res
      .status(200)
      .json(new APIRessponse(200, disLiketweet, "tweet disLike successfully"));
  } else {
    const liketweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new APIRessponse(200, liketweet, "tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //   const LikedVideos = await Like.find(
  //     {
  //       likedBy:req.user?._id
  //   }
  // )

  const LikedVideo = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
  
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"ownerDetails",
              pipeline:[
                {
                  $project:{
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
        ]
      } 
    },
  ]);


  return res
    .status(200)
    .json(
      new APIRessponse(200, LikedVideo, "get All Liked Video Successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
