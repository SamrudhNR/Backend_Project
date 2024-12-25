import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.js";
import {uploadOnCloudinary} from "./utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser= asyncHandler(async(req,res)=>{
    // 1.user details         // 2.validation-not empty
    // 3.user exist? - check  // 4.check for coverimage, avatar
    //upload to cloudinary  // create user object
    // remove password and refresh token field from response
    // return response

    const {fullname, email, username, password}=req.body
    console.log("email: ",email)
    
    if([fullname, email, username, password].some((field)=> field.trim()===""))
        {
        throw new ApiError(400,"All fields is reqired")
    }

    const existUser= User.findOne({
        $or:[{username}, {email}]
    })
    if(existUser){
        throw new ApiError(409,"User with email or username already exist")
    }

    // middleware(multer) give certain access like files
    const avatarLocalPath= req.files?.avatar[0]?.path;
    const CoverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(CoverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar upload failed")
    }

    const user=await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    // to check user creates successfully
    const createdUser= await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"User registration failed")
    }

    return res.status(201).json(                                           // instead of json({message:""}) we do 
        new ApiResponse(200, createdUser, "User registered successfully")  // new object of ApiResponse
    )
})



export {registerUser}