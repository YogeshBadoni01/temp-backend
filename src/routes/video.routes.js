import { Router } from "express";
import { verifytJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, publishAVideo,getVideoById,deleteVideo,updateVideo, togglePublishStatus } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifytJWT);

router.route("/").get(getAllVideos)  //hard so i will do it later first do all videos task
router.route("/").post(
    upload.fields(
    [
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),publishAVideo)
router.route("/:videoId").get(getVideoById)
router.route("/:videoId").delete(deleteVideo)
router.route("/:videoId").patch( upload.single("thumbnail"),updateVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router