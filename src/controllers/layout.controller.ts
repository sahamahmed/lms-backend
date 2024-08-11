import { asyncHandler } from "../utils/asyncHandler.ts";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler.ts";
import cloudinary from 'cloudinary'
import Layout from "../models/layout.model.ts";

//TODO: --- test FAQ seperately
export const createLayout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {type} = req.body
        const typeExists = await Layout.findOne({type})
        if(typeExists){
            return next(new ErrorHandler(`${type} Layout already exists`, 400))
        }

        if (type === "Banner") {
            const {image, title, subTitle} = req.body
            if(!image || !title || !subTitle){
                return next(new ErrorHandler('Please provide all the fields', 400))
            }


            const cloudinaryImage = await cloudinary.v2.uploader.upload(image, {
                folder: 'layout'
            })
            const banner = {
                image: {
                    public_id: cloudinaryImage.public_id,
                    url: cloudinaryImage.secure_url
                },
                title,
                subTitle
            }
            await Layout.create({type, banner})
            
        }  
        if (type === "FAQ") {
            const {faq} = req.body

            if(!faq){
                return next(new ErrorHandler('Please provide all the fields', 400))
            } 
            await Layout.create({type, faq})
        }
        if (type === "Category") {
            const {categories} = req.body
            if(!categories){
                return next(new ErrorHandler('Please provide all the fields', 400))
            }
            await Layout.create({type, categories})
        }

        res.status(200).json({
            success: true,
            message: 'Layout created successfully'
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})


//editing a layout
export const editLayout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
         const {type} = req.body
        if (type === "Banner") {
            let {image, title, subTitle} = req.body
            const bannerData: any = await Layout.findOne({type: "Banner"})
            if(!image || !title || !subTitle){
                return next(new ErrorHandler('Please provide all the fields', 400))
            }


            if (typeof image === 'string'){
                await cloudinary.v2.uploader.destroy(bannerData.banner.image.public_id)

                const cloudinaryImage = await cloudinary.v2.uploader.upload(image, {
                    folder: 'layout'
                })

                    image = {
                        public_id: cloudinaryImage.public_id,
                        url: cloudinaryImage.secure_url
                    }
            }

            const banner = {
                image,
                title,
                subTitle
            }
      
            await Layout.findByIdAndUpdate(bannerData._id ,{type, banner})
            
        }
        if (type === "FAQ") {
            const {faq} = req.body
            const faqData: any = await Layout.findOne({type: "FAQ"})

            if(!faq){
                return next(new ErrorHandler('Please provide all the fields', 400))
            }
            await Layout.findByIdAndUpdate(faqData._id, {type, faq})
        }
        if (type === "Category") {
            const {categories} = req.body

            const categoryData: any = await Layout.findOne({type: "Category"})
            if(!categories){
                return next(new ErrorHandler('Please provide all the fields', 400))
            }
            await Layout.findByIdAndUpdate(categoryData._id, {type, categories})
        }

        res.status(200).json({
            success: true,
            message: 'Layout updated successfully'
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})


//get layout by type
export const getLayoutByType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {type} = req.params
        const layout = await Layout.findOne({type})
        if(!layout){
            return next(new ErrorHandler(`No layout found for ${type}`, 404))
        }

        res.status(200).json({
            success: true,
            layout
        })
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})