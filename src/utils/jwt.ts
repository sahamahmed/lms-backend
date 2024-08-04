
import {redis} from "./redis.ts"
import dotenv from "dotenv";
import { IUser } from "../models/user.model.ts";
import { Response } from "express";
dotenv.config();

interface ITokenOptions {
    expires: Date
    maxAge: number
    httpOnly: boolean
    sameSite: 'lax' | 'strict' | 'none' | undefined
    secure?: boolean
}

 const accessTokenExpiry = parseInt(
  process.env.ACCESS_TOKEN_EXPIRY || "5",
  10
);

 const refreshTokenExpiry = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY || "3",
  10
);


export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpiry * 60 * 1000),
  maxAge: accessTokenExpiry * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response ) => {

    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();



    //UPLOADING SESSION TO REDIS TO MANTAIN CACHE
   try {
    const userId = user._id as unknown as string;
     redis.set(userId, JSON.stringify(user));
   } catch (error) {
     const typedError = error as Error;
     console.error("Error setting Redis value:", typedError.message);
   }
    

    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    })
}