import Notification, { INotification } from "../models/notification.model.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler.ts";
import { IUser } from "../models/user.model.ts";
import cron from 'node-cron'

export const getNotifications = asyncHandler(async (req: Request  & {user: IUser}, res: Response, next: NextFunction) => {
    try {
        const notifications = await Notification.find().sort({createdAt: -1})
        return res.status(200).json({
            success: true,
            notifications
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500)) 
    }
    })


//UPDATE NOTIFICATION STATUS
export const updateNotification = asyncHandler(async (req: Request  & {user: IUser}, res: Response, next: NextFunction) => {
    try {
        const notifId = req.params.id
        const notification: INotification = await Notification.findById(notifId)
        if(!notification){
            return next(new ErrorHandler('Notification not found', 404))
        }

        notification.status = 'read'
        await notification.save()
        const notifications = await Notification.find().sort({createdAt: -1})

        return res.status(201).json({
            success: true,
            notifications
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500)) 
    }
    })


// writing a job to delte the notifications after every 30 days
cron.schedule("0 0 0 * * *" , async()=> { 
    //every day at 12am delete the notifications that are older than 30 days
    const thirdyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await Notification.deleteMany({status: 'read' , createdAt: {$lt: thirdyDaysAgo}})
})

