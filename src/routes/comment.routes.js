import { Router } from "express";
import { verifytJWT } from "../middlewares/auth.middleware.js";
import { getVideoComment,addComment,deleteComment,updateComment } from "../controllers/comment.controllers.js";

const router= Router()

router.use(verifytJWT)

router.route("/:videoId").get(getVideoComment)
router.route("/:videoId").post(addComment)
router.route("/c/:commentId").delete(deleteComment)
router.route("/c/:commentId").patch(updateComment)

export default router