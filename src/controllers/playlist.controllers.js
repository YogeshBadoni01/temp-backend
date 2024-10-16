import mongoose, { isValidObjectId, ObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { APIError } from "../utils/ApiError.js";
import { APIRessponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name && !description) {
    throw new APIError(400, "name & description is required");
  }

  const existPlaylist = await Playlist.findOne({ name });

  if (existPlaylist) {
    throw new APIError(400, "Playlist name already exist");
  }

  const createPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!createPlaylist) {
    throw new APIError(500, "Something went wrong while create Playlist");
  }

  return res
    .status(201)
    .json(
      new APIRessponse(201, createPlaylist, "create Playlist successfully ")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new APIError(400, "user id is Invalid");
  }
  const playlist = await Playlist.find({ owner: userId });

  if (!playlist) {
    throw new APIError(400, "Playlist is not exist");
  }

  const playlistDetails = await Playlist.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              videoFile: 1,
              thumbnail: 1,
              owner: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
  ]);

  // console.log("playlistDetials",playlistDetails)
  // console.log("playlist",playlist)
  if (!playlistDetails) {
    throw new APIError(500, "Some thing went wrong while getting playlist");
  }
  return res
    .status(200)
    .json(new APIRessponse(200, playlistDetails, "Playlist successfully get "));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistById } = req.params;

  if (!isValidObjectId(playlistById)) {
    throw new APIError(400, "playlist id is invalid");
  }

  // const playlist = await Playlist.findById(playlistId)

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistById),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
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
  ]);

  if (!playlist) {
    throw new APIError(400, "playlist is not exist");
  }

  return res
    .status(200)
    .json(new APIRessponse(200, playlist, "playlist get successfully "));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new APIError("Playlist  is invalid");
  }
  if (!isValidObjectId(videoId)) {
    throw new APIError(" videoId is invalid");
  }

  const newVideo = await Video.findById(videoId);

  if (!newVideo) {
    throw new APIError(400, "Video is not exist");
  }

  const addedplaylist = await Playlist.findById(playlistId);

  console.log("addedplaylist", addedplaylist);
  if (!addedplaylist) {
    throw new APIError(200, "playlist is not exist");
  }

  const addVideoToPlaylist = await Playlist.updateOne(
    { _id: playlistId },
    { $push: { video: newVideo } }
  );

  if (!addVideoToPlaylist) {
    throw new APIError(
      500,
      "Something went wrong while adding video to  Playlist"
    );
  }

  return res
    .status(200)
    .json(new APIRessponse(200,addVideoToPlaylist,"add video to playList successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "playlist Id is Invalid");
  }

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "video Id is Invalid");
  }

  const deleteVideo = await Video.findById(videoId);
  const getPlaylist = await Playlist.findById(playlistId);

  console.log("deleteVideo", deleteVideo);
  console.log("getPlaylist", getPlaylist);

  if (!deleteVideo) {
    throw new APIError(400, "Video is not exist");
  }

  if (!getPlaylist) {
    throw new APIError(400, "playlist is not exist");
  }

  const deleteVideoFromPlaylist = await Playlist.updateOne(
    { _id: getPlaylist?._id },
    { $pull: { video: { $in: [videoId] } } }
  );

  console.log(deleteVideoFromPlaylist, "deleteVideoFromPlaylist");

  if (!addVideoToPlaylist) {
    throw new APIError(
      500,
      "Something went wrong while adding video to  Playlist"
    );
  }

  return res
    .status(200)
    .json(new APIRessponse(200,deleteVideoFromPlaylist,`Video is deleted successfully from playlist `));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistById} = req.params

    if(!isValidObjectId(playlistById)){
      throw new APIError(400,"playlist Id is invalid")
    }

    const getPlaylist = await Playlist.findById(playlistById)
    
    if(!getPlaylist){
      throw new APIError(400," playlist is not exist ")
    }

    const playlist =  await Playlist.findByIdAndDelete(playlistById)
    
    if(!playlist){
      throw new APIError(500,"Something went wrong while deleting ")
    }

    return res
          .status(200)
          .json(new APIRessponse(200,playlist,"Playlist deleted successfully"))
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const {playlistById} = req.params
  const {name, description} = req.body

  if(!isValidObjectId(playlistById)){
    throw new APIError(400," playlist is invalid ")
  }

  console.log(name,"name")
  console.log(description,"description")

  if(!(name || description)){
    throw new APIError(400,"Don't skip mendetory field name or description")
  }

  const playlist =  await Playlist.findById(playlistById)

  if(!playlist) {
     throw new APIError(400,"playlist is not exist")
  }

  if(name && !description){
    const updateByName = await Playlist.findByIdAndUpdate(
      playlistById,
      {
        $set:{
          name
        }
      },
      {new:true}
    )

    if(!updateByName){
      throw new APIError(500,"SomeThing went wrong when update name")
    }

    console.log("updateByName",updateByName)

    return res  
          .status(200)
          .json(new APIRessponse(200,updateByName,"Successfully update name in playlist"))
  }

  if(!name && description){
    const updateByDescription = await Playlist.findByIdAndUpdate(
      playlistById,
      {
        $set:{
          description
        }
      },
      {new:true}
    )

    if(!updateByDescription){
      throw new APIError(500,"SomeThing went wrong when update Description")
    }

    return res  
          .status(200)
          .json(new APIRessponse(200,updateByDescription,"Successfully update Description in playlist"))
  }


  if(description && name){
    const updateByBoth = await Playlist.findByIdAndUpdate(
      playlistById,
      {
        $set:{
          name,
          description
        }
      },
      {new:true}
    )

    if(!updateByBoth){
      throw new APIError(500,"SomeThing went wrong when update name and Description")
    }
    return res  
            .status(200)
            .json(new APIRessponse(200,updateByBoth,"Successfully update name and Description playlist"))
  }


});

export {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
};