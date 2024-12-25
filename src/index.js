import connectDB from "./db/connection.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config()


connectDB()

.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server at ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongodb connection failed",err);
})