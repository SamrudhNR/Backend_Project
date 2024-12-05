import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// console.log(process.env.MONGO_URI)

const connectDB= async()=>{
    try{
        const connectInstance= await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB connected- ${connectInstance.connection.host}`);
    }catch(err){
        console.log('MongoDB connection error',err);
        process.exit(1);
    }
};

export default connectDB;