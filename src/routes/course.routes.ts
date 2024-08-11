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
  getSingleCourse,
  getSingleCourseForAdmin,
  getSingleCourseForUser,
  uploadCourse,
} from "../controllers/course.controller.ts";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { updateAccessToken } from "../controllers/user.controller.ts";

const courseRouter = Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);

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
courseRouter.get("/get-content/:id", isAuthenticated ,getSingleCourseForUser);

courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put("/add-reply", isAuthenticated,authorizeRoles("admin"), addReplyToReview);


courseRouter.get("/get-all-courses",isAuthenticated, authorizeRoles("admin"), getAllCoursesForAdmin);
courseRouter.delete("/delete-course/:id",isAuthenticated, authorizeRoles("admin"), deleteCourse);
courseRouter.get("/get-course-content/:id", isAuthenticated, authorizeRoles("admin"), getSingleCourseForAdmin);


export default courseRouter