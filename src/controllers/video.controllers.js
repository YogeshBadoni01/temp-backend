import mongoose, { isValidObjectId, ObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { APIError } from "../utils/ApiError.js";
import { APIRessponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
// import cloundnary from '../utils/cloudinary.js'
import cloundnary from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // const userId = ObjectId("66ebc553aadd6b381074247e");
  if (limit < 0 && page < 0) {
    throw new APIError(404, "error in page or limit");
  }

  // if(!query || )
  // const myquery =String(query) //convert to string
  const myquery = query;
  const AllVideo = await Video.aggregate([
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
              fullName: 1,
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
    },
    {
      $match: {
        "owner._id": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $match: {
        $or: [
          { title: { $regex: myquery, $options: "i" } },
          { description: { $regex: myquery, $options: "i" } },
          { "owner.username": { $regex: myquery, $options: "i" } },
          { isPublished: true },
        ],
      },
    },
    // {

    // },
    {
      $sort: {
        [sortType]: sortBy === "desc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit), //or can add parseInt
    },
  ]);
  console.log(limit);
  if (AllVideo.length > 0) {
    console.log(`userid is valid ${userId}`);
  } else console.log(`userid is not valid ${userId}`);

  return res
    .status(200)
    .json(new APIRessponse(200, AllVideo, "fetch all video from the search"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // get title and description form
  // verify both
  // check for thumbnail,check for videoFile
  // upload them to cloudinary
  // upload details to db
  // check for publishAVideo details
  // return res

  const { title, description } = req.body;

  // console.log(description)
  // if(!title || !description){
  //     throw new APIError(404,"Mendory field is required")
  // }

  const FieldValidation = [title, description].some(
    (field) => field?.trim() === ""
  );
  // console.log(FieldValidation)

  if (FieldValidation) {
    throw new APIError(400, "fill all mendetory field");
  }
  // console.log(req.files)
  // const avatarLocalPath = req.files?.avatar[0].path;
  const videoFileLocalFile = req.files?.videoFile?.[0].path;
  console.log("videoFileLocalFile", videoFileLocalFile);
  const thumbnailLocalFile = req.files?.thumbnail?.[0].path;
  console.log("thumbnailLocalFile", thumbnailLocalFile);

  if (!thumbnailLocalFile && !videoFileLocalFile) {
    //may be deffrenciated in future usecase or error
    // console.log(thumbnailLocalFile?"":`error in thumbnailLocalFile:${thumbnailLocalFile}`)
    // console.log(videoFileLocalFile?"":`error in videoFileLocalFile:${videoFileLocalFile}`)
    throw new APIError(400, "thumbnail or videofile  is missing ");
  }

  const video = await uploadOnCloudinary(videoFileLocalFile);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalFile);
  // console.log(video.duration)
  if (!thumbnail && !video) {
    //may be deffrenciated in future usecase or error
    // console.log(thumbnail?"":`error in thumbnail:${thumbnail}`)
    // console.log(video?"":`error in video:${video}`)
    throw new APIError(
      400,
      "create any problem when uploading thumnail and video "
    );
  }

  
  const videoUpload = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: video.duration,
    owner: req.user?._id,
    isPublished: isPublished || true, //add after test
    // view:view, //add after test
  });

  const createdVideo = await Video.findById(videoUpload._id);
  // console.log(createdVideo)

  if (!createdVideo) {
    throw new APIError(
      500,
      "Something went wrong while upload video and thier details"
    );
  }

  return res
    .status(200)
    .json(
      new APIRessponse(
        201,
        createdVideo,
        "Video upload with details successfully"
      )
    );
  // const publishVideo
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "videoId is not valid");
  }

  // console.log(videoId)
  /*
  // old code
  const video = await Video.findById(videoId);
  console.log(video);
*/
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "like",
      },
    },
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
    {
      $addFields: {
        likesCount: {
          $size: "$like",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$like.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project:{
        videoFile:1,
        thumbnail:1,
        ownerDetails:1,
        title:1,
        description:1,
        duration:1,
        views:1,
        isPublished:1,
        likesCount:1,
        isLiked:1,
      }
    },
  ]);

  if (!video) {
    throw new APIError(400, "Video is missing");
  }

  //incress video views
  await Video.updateOne(
    {_id:videoId},
    { $inc:{views:1}}
  )

  return res
    .status(200)
    .json(new APIRessponse(201, video, "Video get successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "videoId is not valid");
  }

  const video = await Video.findById(videoId);
  // console.log("video",video)

  if (!video) {
    throw new APIError(400, "Video is missing");
  }

  //TODO : -if user want to delete another user video will not be done

  if (owner._id.equals(req.user?._id)) {
    const deleteVideo = await deleteOnCloudinary(video.videoFile, "video");
    console.log("deleteVideo", deleteVideo);

    const deleteThumbnail = await deleteOnCloudinary(video.thumbnail, "image");
    console.log("deleteThumbnail", deleteThumbnail);
    await Video.findByIdAndDelete(videoId);
  } else {
    throw new APIError(
      403,
      "You Don't have permission for delete",
      "access denied."
    );
  }

  return res
    .status(200)
    .json(new APIRessponse(200, video.title, "video Delete successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  // get id from params && and get user field data from body && get thumbnail

  // findid form data base
  // perform a update fuction
  // send data to user
  

  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "video id is not valid");
  }

  if (!thumbnailLocalPath) {
    throw new APIError(400, "thumbnail is missing");
  }

  // if(!title && !description){ //if developer want to update title of description medatory
  //     throw new APIError("")
  // }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(400, "video id is not correct");
  }
  if (video.owner.equals(req.user?._id)) {
    await deleteOnCloudinary(video.thumbnail, "image");
    let thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    // console.log("thumbnail",thumbnai

    if (!thumbnail) {
      throw new APIError(400, "problem when update to cloudnary");
    }
  } else {
    return res
      .status(403)
      .json(
        new APIError(
          403,
          "You Don't have permission for update",
          "access denied."
        )
      );
  }
  console.log(thumbnail, "thumbnail");
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || "",
        description: description || "",
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new APIRessponse(200, updateVideo, "Video details successfully updated")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Video Id is Invalid");
  }

  const video = await Video.findById(videoId);
  if ((req.user?._id).equals(video.owner)) {
    try {
      if (video.isPublished) {
        await Video.findByIdAndUpdate(
          videoId,
          {
            $set: {
              isPublished: false,
            },
          },
          { new: true }
        );
      } else {
        await Video.findByIdAndUpdate(
          videoId,
          {
            $set: {
              isPublished: true,
            },
          },
          { new: true }
        );
      }
    } catch (error) {
      console.log(error);
    }
    //   console.log("video.isPublished", video.isPublished);
  } else {
    throw new APIError(403, "Access Denied");
  }
  return res
    .status(200)
    .json(new APIRessponse(200, video, "isPublished status update"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
};
