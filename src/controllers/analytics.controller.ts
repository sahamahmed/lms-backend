import { generateLast12MonthData } from "../utils/analytics.generator.ts";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import ErrorHandler from "../utils/ErrorHandler.ts";
import User from "../models/user.model.ts";
import Course from "../models/course.model.ts";
import Order from "../models/order.model.ts";


export const getUserAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await generateLast12MonthData(User)
        res.status(200).json({
            success: true,
            data,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
    })

export const getCourseAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await generateLast12MonthData(Course)
        res.status(200).json({
            success: true,
            data,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
    })

export const getOrderAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await generateLast12MonthData(Order)
        res.status(200).json({
            success: true,
            data,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
    })
