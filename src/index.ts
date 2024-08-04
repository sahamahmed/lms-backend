import express from "express";
import { app } from "./app.ts";
import dotenv from "dotenv";
import dbConnect from "./utils/dbConnect.ts";
import {v2 as cloudinary} from "cloudinary";
dotenv.config();

const PORT = process.env.PORT || 8000;

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect()
});
