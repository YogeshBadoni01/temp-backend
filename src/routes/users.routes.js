import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, refreshAccessToken, registerUser, UpdateAccountDetails, UpdateUserAvatar, UpdateUserCoverImage } from "../controllers/users.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifytJWT } from "../middlewares/auth.middleware.js";

const router =Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },  
        {
            name:"coverImage",
            maxCount:1
        },
    ]) , 

    registerUser)

    router.route("/login").post(loginUser)

    //secured routes
    router.route("/logout").post(verifytJWT,logOutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifytJWT,changeCurrentPassword)
    router.route("/current-user").get(verifytJWT,getCurrentUser)
    router.route("/update-account").patch(verifytJWT,UpdateAccountDetails)
    router.route("/avatar").patch(verifytJWT,upload.single("avatar"),UpdateUserAvatar)
    router.route("/cover-image").patch(verifytJWT,upload.single("coverImage"),UpdateUserCoverImage)
    router.route("/c/:username").get(verifytJWT,getUserChannelProfile)
    router.route("/watch-hitory").get(verifytJWT,getWatchHistory)





export default router