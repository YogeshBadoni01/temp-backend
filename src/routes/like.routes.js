import {Router} from 'express'
import { verifytJWT } from '../middlewares/auth.middleware.js'
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from '../controllers/like.controllers.js'

const router= Router()

router.use(verifytJWT)

router.route("/toggle/video/:videoId").post(toggleVideoLike)
router.route("/toggle/comment/:commentId").post(toggleCommentLike)
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike)
router.route("/likedVideo").get(getLikedVideos)

export default router