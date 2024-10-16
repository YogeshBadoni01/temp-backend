import { Router } from "express";
import { verifytJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controllers.js";

const router = Router()

router.use(verifytJWT)

router.route("/").post(createTweet)
router.route("/").get(getUserTweet)
router.route("/:tweetId").patch(updateTweet)
router.route("/:tweetId").delete(deleteTweet)

export default router