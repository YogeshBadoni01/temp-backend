import { Router } from "express";
import { verifytJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js";

const router =  Router()

router.use(verifytJWT)

router.route("/stats").get(getChannelStats)
router.route("/videos").get(getChannelVideos)

export default router