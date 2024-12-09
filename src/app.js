import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credential:true
    }
));
app.use(express.json({limit:"16kb"}))   // data from forms i.e json
app.use(express.urlencoded({extended:true}))   // to get data from url
app.use(express.static("public"))       // images, favicon or any public assets
app.use(cookieParser())

export default app;