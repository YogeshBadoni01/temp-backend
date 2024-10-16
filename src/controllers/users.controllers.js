import { APIError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {APIRessponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { Subscription } from "../models/subscription.model.js"
import mongoose from "mongoose"

const generateAccessTokenRefreshToken =   async (userId) => {
    // console.log(userId)
    try {
        const user = await User.findById(userId)
        // console.log(user)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // console.log("accessToken",accessToken)
        // console.log("refreshToken",refreshToken)

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave:false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new APIError(500,"something went wrong while creating refresh and access token")
        // console.log(error)
    }
}



const registerUser = asyncHandler(async(req,res) => {
    // res.status(200).json({message:"ok"})

    //algorithm to create user

    // get details from frontend
    // validation (not empty)
    // check user already exist (username or email)
    // check for images,check for avator( medatory avatar)
    // upload them to cloudinary , avatar
    // create user object (create entry in db)
    // remove passport and refreshtoken field from response 
    // check for user creation
    // return res
    
    const {username,email,fullName,password} =req.body
    // console.log("email:",email)
    // console.log(req) //just for knewledge purpose


    const fieldValidation = [username,email,fullName,password].some((field) =>field?.trim() === "")
    if(fieldValidation){
        throw new APIError(400,"ALL User field is mendetory")
    }


    const existingUser =await User.findOne({
        $or: [{username},{email}]
    })


    if (existingUser) {
        throw new APIError(409,"User with email or username already exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(req.files)

    // const CoverImageLocalPath =req.files?.CoverImage[0].path
    // console.log(req.files)

    let CoverImageLocalPath 
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        CoverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar Image is mendatory")
    }


    const avator = await uploadOnCloudinary(avatarLocalPath)
    const coverImage =await uploadOnCloudinary(CoverImageLocalPath)


    if(!avator){
        throw new APIError(400,"Avatar Image is mendatory")
    }


    const user = await User.create({
                        username:username.toLowerCase(),
                        email,
                        fullName,
                        avatar:avator.url,
                        coverImage:coverImage?.url || "",
                        password
                    })

                    // console.log("user",user._id)
    const createUser = await User.findById(user._id).select("-password -refreshToken")
    // await User.findById(user._id).select(
    //     " -password -refreshToken"
    // )

    // console.log("user._id",user._id)
    // console.log("createUser",createUser)
    if(!createUser){
        throw new APIError(500,"Something went wrong while register User")
    }

    return res.status(201).json(
         new APIRessponse(201, createUser,"User is Created Successfully")
    )
    

}) 

const loginUser = asyncHandler(async (req ,res) => {
    // req.body -> data
    // username or email
    // find the user
    // password check 
    // access and refresh token 
    // send cookies

    const {username , email ,password} = req.body

    if(!(username || email)){
        throw new APIError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user) {
        throw new APIError(404,"user does not exist")
    }
    // console.log(password)
    const isPasswordValid =await user.isPasswordCorrect(password)

    // console.log(isPasswordValid)
    if(!isPasswordValid) {
        throw new APIError(401,"Invalid user credantioal")
    }
    console.log(user._id)

    const {accessToken ,refreshToken} = await generateAccessTokenRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken' )

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new APIRessponse(200,{

            user:accessToken,refreshToken,loggedInUser
        },
        "User successfully logged in"
        )
    )

    
    
})

const  logOutUser  =asyncHandler( async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {

            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true 
            /*
                 In the context of Mongoose, the new option in the findByIdAndUpdate method determines 
                 whether the function returns the original document or the updated one.

                new: true: This returns the updated document after the update operation is applied.
                new: false (or if you omit the new option): This returns the original document before 
                    the update was applied.
            */
        }
    )

     const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new APIRessponse(200,{},"User Logged out successfully"))
})

const refreshAccessToken = asyncHandler( async(req,res) => {
    const incomingRefreshToken =req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new APIError(401,"Unauthorized request")
    }

    try {
        const decodedToken =jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user =await User.findById(decodedToken._id)
    
        if(!user){
            throw new APIError("Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new APIError("refresh token is expired or used")
        }
    
    
    
        const {accessToken,newRefreshToken} = await generateAccessTokenRefreshToken(user._id)
    
        const option = {
            httpOnly:true,
            secure:true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new APIRessponse(200,{accessToken,refreshToken:newRefreshToken},"Access token refreshed")
        )
    } catch (error) {
        throw new APIError(401,error?.message||"Invlalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} =req.body

    // console.log("req.body",req.body)
    // console.log("oldPassword",oldPassword,"\n newPassword",newPassword)
    const user= await User.findById(req.user?._id)
    // console.log("user",user) 
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)

  
    console.log("isPasswordCorrect",isPasswordCorrect)

    if (!isPasswordCorrect) {
        throw new APIError(400,"Invalid old Password")
    }

    user.password= newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new APIRessponse(200,user,"successfully Change Password with new password"))
})

const getCurrentUser = asyncHandler(asyncHandler (async (req,res) => {
    
    return res
    .status(200)
    .json(new APIRessponse(200,req.user,"Get current User successfully"))
}))

const UpdateAccountDetails = asyncHandler(async (req,res) => {  
    
    const {fullName, email} = req.body

    // console.log(req.body)
    
    if(!(fullName || email)) {
        throw new APIError(200,"Required all Medatroy field for update")
    }
    // console.log("fullName",fullName,"\nemail",email)

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new :true}
    ).select("-password")
    console.log("user",user._id)
    return res
    .status(200)
    .json(new APIRessponse(200,user,"User Update Successfully"))
})

const UpdateUserAvatar = asyncHandler( async (req,res) => {
    
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar Images missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new APIError(400,"Problem ! when Uploading Avatar")
    }

    //update to db

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new APIRessponse(200,user,"Update Avatar successfully"))
})

const UpdateUserCoverImage= asyncHandler(async(req,res) => {
    
    const coverImageLocalPath =req.file?.path

    if (!coverImageLocalPath) {
        throw new APIError(400,"Cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        throw new APIError(400,"Problem ! when uploading Cover Image")
    } 


    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new :true}
    ).select("-password")

    return res
    .status(200)
    .json(new APIRessponse(200,user,"Cover Image is successfully updated"))
})

const getUserChannelProfile = asyncHandler( async (req,res) => {

    const {username} = req.params

    if(!username.trim){
        throw new APIError(400,"username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscripbedTo"
            }
        },
        {
            $addFields: {
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsubscripbedToCount:{
                    $size:"$subscripbedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }

            }
        },
        {
            $project:{
                fullName:1,
                email:1,
                username:1,
                subscribers:1,
                coverImage:1,
                channelsubscripbedToCount:1,
                isSubscribed:1,
                avatar:1,
                // coverImage:1,
            }

        }
    ])

    if(!channel?.length){
        throw new APIError(404,"Channel does not exist")
    }

    return res
    .status(200)
    .json(new APIRessponse(200,channel[0],"User channel fetch successfully"))
})

const getWatchHistory= asyncHandler(async (req,res) => { //prectice perpose
    const user= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
    
                        }
                    }
                ]
            }  
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new APIRessponse(201,user[0].watchHistory,"successfuly get watch history"))
})



export {registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,UpdateAccountDetails,UpdateUserAvatar,UpdateUserCoverImage,getUserChannelProfile,getWatchHistory}