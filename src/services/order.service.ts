import { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Order from "../models/order.model.ts";

export const newOrder = asyncHandler(async (data: any, res: Response, next:NextFunction) => {
    const order = await Order.create(data)
    res.status(200).json({
            success: true,
            message: 'Order placed successfully',
            order
        })
})