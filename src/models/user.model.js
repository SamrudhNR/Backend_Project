import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from"bcrypt";


// mongoose.connection.on("open", async () => {
//     try {
//         const userCollection = mongoose.connection.collection('users');
//         await userCollection.dropIndex('usernmae_1');  // The problematic index
//         console.log('Index dropped successfully');
//     } catch (err) {
//         console.error('Error dropping index:', err);
//     }
// });


const userSchema= new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim :true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,  // cloudinary url
            required:true,
        },
        coverImage:{
            type:String, // cloundinary url
        },
        watchHistory:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }],
        password:{
            type:String,
            required:[true, 'Password is required']
        },
        refreshToken:{
            type:String,
        }
    },{timestamps:true})

// before saving user in db password is encrypted
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next(); // only if password is changed then change it

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// to design custom methods we use  .methods present in userSchema
userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const User= mongoose.model('User', userSchema);