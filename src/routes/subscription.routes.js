import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscriber,toggleSubscription } from "../controllers/subscription.controllers.js" ;

const router = Router()

router.route("/c/:channelId").get(getUserChannelSubscriber)
router.route("/c/:channelId").post(toggleSubscription)
router.route("/u/:subscriber").get(getSubscribedChannels)

export default router