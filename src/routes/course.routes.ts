import { Router } from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  getAllCourses,
  getAllCoursesForAdmin,
  getSingleCourse,
  getSingleCourseForUser,
  uploadCourse,
} from "../controllers/course.controller.ts";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";

const courseRouter = Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);

courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),  
  uploadCourse
);

courseRouter.get(
  "/get-course/:id",
  getSingleCourse
);

courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id", isAuthenticated ,getSingleCourseForUser);

courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put("/add-reply", isAuthenticated,authorizeRoles("admin"), addReplyToReview);


courseRouter.get("/get-all-courses",isAuthenticated, authorizeRoles("admin"), getAllCoursesForAdmin);
courseRouter.delete("/delete-course/:id",isAuthenticated, authorizeRoles("admin"), deleteCourse);


export default courseRouter