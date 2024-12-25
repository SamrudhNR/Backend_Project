import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials:true
    }
));
app.use(express.json({limit:"16kb"}))   // data from forms i.e json
app.use(express.urlencoded({extended:true}))   // to get data from url
app.use(express.static("public"))       // images, favicon or any public assets
app.use(cookieParser())


// routes

import userRouter from './routes/user.routes.js';

app.use("/api/v1/users",userRouter)

export default app;