import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/Users.models.js"
import {uplodeFileToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

const registorUser =  asyncHandler( async (req, res) => {
    //taking input from the user 
    //validation - not empty
    //check if user is already exist 
    //check for avatar
    //upload them to cloudinary
    //save datain db
    //check if user is created or not
    //remove pasword and refreshtoken field form response
    //response
    
    const {username, fullName, email, password} = req.body
    
    if (
        [fullName, email, username, password].some((field) => field?.trim()===" ")
    ) {
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or :[{email}, {username}]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avater is required")
    }

    const avatar = await uplodeFileToCloudinary(avatarLocalPath)
    const coverImage = await uplodeFileToCloudinary(coverImageLocalPath)    

    if (!avatar) {
        throw new ApiError(500, "Aveter is required")
    }

    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || " ",
            username,
            email,
            password
        }
    )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "user creation get failed")
    }

    return res.status(201).json(
        new ApiResponse(200), createdUser, "user register successfully")
      
})

export { registorUser }