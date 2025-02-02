import { Router } from "express";
import { loginUser, 
    logoutUser, 
    registorUser,
    refreshAccessToken, 
    getCurrentUser,
    updateAccountDetails,
    updateAvatar, 
    getUserChannelProfile, 
    getWatchHistory } 
    from "../controllers/user.controllers.js";

import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
        
    ]),
    registorUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-Password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").post(verifyJWT,getCurrentUser)
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails)

router.route("/updateAvatar").post(verifyJWT,upload.single("avatar"),updateAvatar)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router