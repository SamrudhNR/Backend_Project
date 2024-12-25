import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens= async(userId)=>{
    try{
        const user= await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "Internal Server Error while generating access and refresh tokens");
    }
}



const registerUser= asyncHandler(async(req,res)=>{
    // 1.user details         // 2.validation-not empty
    // 3.user exist? - check  // 4.check for coverimage, avatar
    //upload to cloudinary  // create user object
    // remove password and refresh token field from response
    // return response

    const {fullname, email, username, password}=req.body
    console.log("email: ",email)
    console.log("username: ",username)
    
    if([fullname, email, username, password].some((field)=> field.trim()===""))
        {
        throw new ApiError(400,"All fields is reqired")
    }

    const existUser=await  User.findOne({
        $or:[{username}, {email}]
    })
    if(existUser){
        throw new ApiError(409,"User with email or username already exist")
    }

    // middleware(multer) give certain access like files
    console.log('req.files=',req.files)
    const avatarLocalPath= req.files?.avatar[0]?.path;
    const CoverImageLocalPath= req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath) // returns object
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
});


const loginUser= asyncHandler(async(req,res)=>{
    // req body ->data          // username, email
    //find user                 //password check
    //access and refresh token  // send cookie

    const {email, password,username}= req.body

    if(!username || !email){
        throw new ApiError(400,"Username and email are required")
    }
    const user= await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options= {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, loggedInUser, "User logged in successfully")
    )
});

const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options= {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User logged out successfully"))
})


export {registerUser , loginUser, logoutUser}