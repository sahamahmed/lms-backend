import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Course from "../models/course.model.ts";


export const createCourse = asyncHandler(async (data: any, res:Response) => {
   const course = await Course.create(data);
   res.status(201).json({
       success: true,
       course
   })
});