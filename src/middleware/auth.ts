import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import ErrorHandler from "../utils/ErrorHandler.ts";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redis } from "../utils/redis.ts";
import mongoose from "mongoose";
import { IUser } from "../models/user.model.ts";


export interface RedisUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: mongoose.Schema.Types.ObjectId }>;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CustomRequest extends Request {
  user: RedisUser;
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const access_token = req.cookies.access_token as string;
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401)
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;
    } catch (err) {
      return next(new ErrorHandler("Invalid access token", 401));
    }

    if (!decoded || !decoded.id) {
      return next(new ErrorHandler("Invalid access token", 401));
    }

    const user = await redis.get(decoded.id);
    if (!user) {
      console.error("User not found in Redis");
      return next(new ErrorHandler("Please login to access this resource", 404));
    }

    let newUser: RedisUser;
    try {
      newUser = JSON.parse(user);
    } catch (err) {
      console.error("Error parsing user data:", err);
      return next(new ErrorHandler("Invalid user data", 500));
    }

    if (!newUser) {
      console.error("Parsed user is null or undefined");
      return next(new ErrorHandler("Invalid user data", 500));
    }

    (req as CustomRequest).user = newUser;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return next(new ErrorHandler("Authentication error", 401));
  }
};



export const authorizeRoles = (role: string) => {
  return async (
    req: Request & { user: IUser },
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    if (user.role !== role) {
      return next(
        new ErrorHandler(`User ${user.name} is not authorized as ${role}`, 403)
      );
    }
    next();
  };
};