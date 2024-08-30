import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Course from "../models/course.model.ts";
import { redis } from "../utils/redis.ts";


export const createCourse = asyncHandler(async (data: any, res:Response) => {
   const course = await Course.create(data);
    const allCourses = JSON.parse(await redis.get("allCourses"))
    allCourses.push(course)
    await redis.set("allCourses", JSON.stringify(allCourses))
   res.status(201).json({
       success: true,
       course
   })
});