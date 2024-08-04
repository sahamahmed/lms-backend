import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import Course, { IComment, IReview } from "../models/course.model.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import ErrorHandler from "../utils/ErrorHandler.ts";
import { createCourse } from "../services/course.service.ts";
import { redis } from "../utils/redis.ts";
import { IUser } from "../models/user.model.ts";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail.ts";
import Notification from "../models/notification.model.ts";



export const uploadCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {    
try {
    const data = req.body
    const thumbnail = data.thumbnail
    if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "courses",
        })
        console.log(myCloud.secure_url, myCloud.public_id)

        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    createCourse(data, res, next)
} catch (error: any) {
    return next(new ErrorHandler(error.message, 500))
}    
})


export const editCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const courseId = req.params.id
        const thumbnail = data.thumbnail
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id)
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        }

        const course = await Course.findByIdAndUpdate(
            courseId,
            { $set: data},
            { new: true,}
            )

            res.status(200).json({
                success: true,
                course,
            })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//WHEN USER HAS NOT PURCHASED THE COURSE
export const getSingleCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id

        const isCacheExist = await redis.get(courseId)
       if (isCacheExist) {
        console.log('CACHE EXISTS')
        const course = JSON.parse(isCacheExist)
        res.status(200).json({
            success: true,
            course,
            });
       } else {
        console.log("GETTING FROM DB");
         const course = await Course.findById(req.params.id).select(
           "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links "
         );

         await redis.set(courseId, JSON.stringify(course),"EX", 604800) 

         if (!course) {
           return next(new ErrorHandler("Course not found", 404));
         }

         res.status(200).json({
           success: true,
           course,
         });
       }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})
//WHEN USER HAS NOT PURCHASED THE COURSE
export const getAllCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses")
        if (isCacheExist) {
            console.log('CACHE EXISTS')
            const courses = JSON.parse(isCacheExist)
            res.status(200).json({
                success: true,
                courses,
            });
        } else {
            console.log("GETTING FROM DB");
            const courses = await Course.find().select(
              "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            );

            await redis.set("allCourses", JSON.stringify(courses))

            res.status(200).json({
              success: true,
              courses,
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})




// GET COURSE CONTENT FOR VALID USER
export const getSingleCourseForUser = asyncHandler(async (req: Request & { user: IUser }, res: Response, next: NextFunction) => {
    try {
        const userCourses = req.user.courses
        const courseId = req.params.id

        const courseExists = userCourses.find((course) => course.courseId.toString() === courseId)

        if (!courseExists) {  
            return next(new ErrorHandler("You do not have access to this course", 404))
        }

        const content = await Course.aggregate([
            {$match: {
                _id: new mongoose.Types.ObjectId(courseId)
            }},
            { $project: {
                courseData: 1
            }}
        ])

        res.status(200).json({
            success: true,
            content,
        })
         
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})


//ADD QUESTIONS TO A COURSE
interface IAddQuestionData{
    question: string
    courseId: string
    contentId: string
}

export const addQuestion = asyncHandler(async (req: Request & {user: IUser}, res: Response, next: NextFunction) => {
    try {
        const {question, courseId, contentId} = req.body as IAddQuestionData
        const course = await Course.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid ID", 400))            
        }

          const courseContent = course.courseData.find(
            (item) => item._id.toString() === contentId
          );

            if (!courseContent) {
                return next(new ErrorHandler("Course content not found", 404));
            }

            // creaating a new question object
            const newQuestion:any = {
                user: req.user,
                question,
                questionReplies: [],
            };

        // add this question to the course content
        courseContent.questions.push(newQuestion)

        // notification for the admin
         await Notification.create(
            {
            title: 'New Question',
            message: `You have a new question from ${courseContent.title}`,
            user: req.user._id
        }
        )

        await course.save()

        res.status(200).json({
            success: true,
            course,
        })

     
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})


//ADD ANSWER IN COURSE QUESTION
interface IAddAnswerData{
    questionId: string
    answer: string
    courseId: string
    contentId: string
}
export const addAnswer = asyncHandler(async (req: Request & {user: IUser}, res: Response, next: NextFunction) => {
    try {
        const {questionId, answer, courseId, contentId} = req.body as IAddAnswerData
        const course = await Course.findById(courseId)

        if (
          !mongoose.Types.ObjectId.isValid(courseId) ||
          !mongoose.Types.ObjectId.isValid(contentId)
        ) {
          return next(new ErrorHandler("Invalid ID", 400));
        }

        const courseContent = course.courseData.find(
          (item) => item._id.toString() === contentId
        );

        if (!courseContent) {
          return next(new ErrorHandler("Course content not found", 404));
        }

        const question = courseContent.questions.find(
          (item) => item._id.toString() === questionId
        );

        if (!question) {
          return next(new ErrorHandler("Question not found", 404));
        }

        const newAnswer: any = {
          user: req.user,
          answer,
        };

        question.questionReplies.push(newAnswer);

        await course.save()

        if (req.user._id === question.user._id) {
             await Notification.create(
            {
            title: 'New Answer',
            message: `You have a new answer to question from ${courseContent.title}`,
            user: req.user._id
        }
        )
        }else{
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }

            const html = await ejs.renderFile(path.join(__dirname, "../mails/questionReply.ejs"), data)

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "questionReply.ejs",
                    data
                })
            } catch (error) {
                return next(new ErrorHandler(error.message, 500))
            }
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})


//ADDING REVIEW TO A COURSE
interface IAddReviewData{
    rating: number
    review: string
    courseId: string
    userId: string
}
export const addReview = asyncHandler(async (req: Request & {user:IUser}, res: Response, next: NextFunction) => {
    try {
        const {rating, review} = req.body as IAddReviewData
        const userCourseList = req.user.courses
        const courseId = req.params.id
        const courseExists = userCourseList.find((course) => course.courseId.toString() === courseId.toString())

        if (!courseExists) {  
            return next(new ErrorHandler("You do not have access to this course", 404))
        }

        const course = await Course.findById(courseId)

        if (!course) {
            return next(new ErrorHandler("Course not found", 404))
        }

        const reviewData: any = {
            user: req.user,
            comment: review,
            rating
        }

        course.reviews.push(reviewData)

        let average = 0
        course.reviews.forEach((review: any) => {
            average += review.rating
        })

        course.ratings = average / course.reviews.length

        await course.save()

        const notification ={
            title: "New message recieved",
            message: `${req.user.name} has added a review to ${course.name}`
        }

        //create notification later

        res.status(200).json({
            success: true,
            course,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//ADD REPLY TO REVIEW- ONLY FOR ADMIN
interface IAddReplyToReviewData{
    reviewId: string
    comment: string
    courseId: string   
}
export const addReplyToReview = asyncHandler(async (req: Request & {user: IUser}, res: Response, next: NextFunction) => {
    try {
        const {reviewId, comment, courseId} = req.body as IAddReplyToReviewData
        const course = await Course.findById(courseId)
        if (!course) {
            return next(new ErrorHandler("Course not found", 404))
        }

        const review = course.reviews.find((rev: any)=> rev._id.toString() === reviewId)
        if (!review) {
            return next(new ErrorHandler("Review not found", 404))
        }

        const replyData: any = {
            user:req.user,
            comment
        }

        if (!review.commentReplies) {
            review.commentReplies = []
        }

        review.commentReplies.push(replyData)
        await course.save()

        res.status(200).json({
            success: true,
            course,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// ADMIN ROUTES

export const getAllCoursesForAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const courses = await Course.find().sort({createdAt: -1})
    res.status(200).json({
      success: true,
      courses
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
})

export const deleteCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id
        const course = await Course.findByIdAndDelete(courseId)
        if (!course) {
            return next(new ErrorHandler("Course not found", 404)) 
        }

        if (course?.thumbnail?.public_id) {
            await cloudinary.v2.uploader.destroy(course.thumbnail.public_id)        
        }

        await redis.del(courseId)
        
        const allCourses = JSON.parse(await redis.get("allCourses"))
        const filteredCourses = allCourses.filter((c:any)=> c._id !== courseId)
        await redis.set("allCourses", JSON.stringify(filteredCourses))

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
})