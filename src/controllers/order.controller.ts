import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import ErrorHandler from "../utils/ErrorHandler.ts";
import Order, { IOrder } from "../models/order.model.ts";
import User, { IUser } from "../models/user.model.ts";
import Course from "../models/course.model.ts";
import { newOrder } from "../services/order.service.ts";
import ejs from 'ejs'    
import path from "path";
import sendMail from "../utils/sendMail.ts";
import mongoose from "mongoose";
import Notification from "../models/notification.model.ts";

export const createOrder = asyncHandler(async (req: Request & {user: IUser}, res:Response, next:NextFunction) => {
    try {
        const {courseId, paymentInfo} = req.body as IOrder

        const user = await User.findById(req.user._id)

        const courseExists = user.courses.find((course) => course.courseId.toString() === courseId.toString())

        if (courseExists) {  
            return next(new ErrorHandler("You already have purchased this course", 400))
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return next(new ErrorHandler("Course not found", 404))
        }


        const data: any = {
            courseId: course._id,
            userId: user._id,
            paymentInfo
        }

        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
            }
        }

        const html = await ejs.renderFile(path.join(__dirname,'../mails/order-confirmation.ejs'), {order: mailData})
        
        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: 'Order Confirmation',
                    template: "order-confirmation.ejs",
                    data: mailData
                })
            }  
        } catch (error) {
            return next(new ErrorHandler(error.message, 500))
        }

    user.courses.push({ courseId: course._id });

    await user.save()

    // FOR ADMIN
         await Notification.create(
            {
            title: 'Course Purchase',
            message: `You have a new order from ${course.name}`,
            user: user._id
        }
        )

        course.purchased ?  course.purchased += 1 : course.purchased
        
        await course.save()

        newOrder(data, res, next)

        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// ADMIN ROUTES
export const getAllOrdersForAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const orders = await Order.aggregate([
        {$match: {}},
        {$sort: {createdAt: -1}},
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    {
                        $project: {
                            email: 1,
                            name: 1,
                            _id : 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course',
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            price: 1,
                            _id : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                user: { $arrayElemAt: ['$user', 0] },
                course: { $arrayElemAt: ['$course', 0] }
            }
        }
    ])
    res.status(200).json({
      success: true,
      orders
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
})