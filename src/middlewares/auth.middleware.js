import { User } from "../models/user.models.js"
import { APIError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from 'jsonwebtoken'

export const verifytJWT = asyncHandler( async (req, _,next) => { //res perposnal to _ when not used

    try {
        const token = req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log("token",token)
        if(!token){
            throw new APIError(401,"Unauthorized request")
        }
        
        //check token is valid or not
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // console.log("decodedToken",decodedToken)
        

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        // console.log("user",user)
    
        if(!user){
            throw new APIError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new APIError(401,error?.message || "invalid Access Token")
    } 


})