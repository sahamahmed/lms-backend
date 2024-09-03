import { Router } from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  getAllCourses,
  getAllCoursesForAdmin,
  getMyCourses,
  getSingleCourse,
  getSingleCourseForAdmin,
  getSingleCourseForUser,
  uploadCourse,
} from "../controllers/course.controller.ts";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { updateAccessToken } from "../controllers/user.controller.ts";

const courseRouter = Router();

courseRouter.post("/create-course", uploadCourse);

courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("admin"),  
  editCourse
);

courseRouter.get(
  "/get-course/:id",
  getSingleCourse
);

courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-my-courses", updateAccessToken, isAuthenticated, getMyCourses)
courseRouter.get("/get-content/:id", updateAccessToken, isAuthenticated ,getSingleCourseForUser);

courseRouter.put("/add-question", updateAccessToken, isAuthenticated, addQuestion);
courseRouter.put("/add-answer", updateAccessToken, isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", updateAccessToken, isAuthenticated, addReview);
courseRouter.put("/add-reply", updateAccessToken, isAuthenticated,authorizeRoles("admin"), addReplyToReview);


courseRouter.get("/get-all-courses", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllCoursesForAdmin);
courseRouter.delete("/delete-course/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), deleteCourse);
courseRouter.get("/get-course-content/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getSingleCourseForAdmin);


export default courseRouter