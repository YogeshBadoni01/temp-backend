import { Router } from "express";
import { verifytJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";

const router= Router()

router.use(verifytJWT)

router.route("/").post(createPlaylist)
router.route("/:playlistById").get(getPlaylistById)
router.route("/:playlistById").patch(updatePlaylist)
router.route("/:playlistById").delete(deletePlaylist)
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist)
router.route("/user/:userId").get(getUserPlaylists)
    
export default router