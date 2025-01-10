import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/Users.models.js"
import {uplodeFileToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (UserId) => {
  try {
    const user = await User.findById(UserId)
    const accessToken =  user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "went worng while generating access and refresh token")
  }
}

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

const loginUser = asyncHandler(async (req, res) => {
    // get data form body
    // check email or username exist or not
    // if exist then check password is valid or not 
    // if valid then generate refresh and access token
    // save refresh token in database
    // send cookies 
    const {username, email, password} =  req.body

    if (!username && !email) {
        throw new ApiError(400, "email or username is required")
    }

    const user = await User.findOne(
        {
            $or:[{email}, {username}]
        })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const passwordValidation =  await user.isPasswordCorrect(password)

    if (!passwordValidation) {
        throw new ApiError(401, "Password incorect")
    }
    
    const {accessToken, refreshToken} =  await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -resfreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInUser, accessToken
            }, 
            "User Logged in Successfully"
        )
    )
}
)

const logoutUser = asyncHandler(async (req, res) => {
  //check user is logged in or not
  //clear cookie
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out succeessfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if (!user) {
            throw new ApiError(401, "Invalide refresh Token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly :true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, "Invalid Refresh Token")
    }
}
)

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} =  req.body

    const user = await User.findById(req.user?.id)

    const isPasswodCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswodCorrect) {
        throw new ApiError("401", "Password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(200,{}, "Password Changed successfully")
}
)

const getCurrentUser = asyncHandler( async (req,res) => {
      return res
      .status(200)
      .json(200, req.user, "User fatched successfully")
}
)

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullName, email} =  req.body

  if (!fullName || !email) {
    throw new ApiError(401, "New fullname and email is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: {
            fullName,
            email
        }
    },
    {
        new: true
    }
  ).select("-password -refreshToken")

  return res.status(200)
  .json(new ApiResponse(200, user, "Fullname and email is updated"))
}
)

const updateAvatar = asyncHandler(async (req, res) => {
    const localFilePath = req.field?.path
    
    if (!localFilePath) {
        throw new ApiError(401, "Avatar is required")
    }

    const avatar = await uplodeFileToCloudinary(localFilePath)

    if (!avatar) {
        throw new ApiError(500, "Someting went worng while uploading file in cloudinary ")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar?.url
            }
        },
        {
            new: true
        }
    ).select("-password - refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(201, user, "Avatar is updated successfully"))

    
})
const updateCoverImage = asyncHandler(async (req, res) => {
    const localFilePath = req.field?.path
    
    if (!localFilePath) {
        throw new ApiError(401, "Avatar is required")
    }

    const coverImage = await uplodeFileToCloudinary(localFilePath)

    if (!coverImage) {
        throw new ApiError(500, "Someting went worng while uploading file in cloudinary ")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage: coverImage?.url
            }
        },
        {
            new: true
        }
    ).select("-password - refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(201, user, "Cover image is updated successfully"))

    
})


export {
    registorUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage
    }