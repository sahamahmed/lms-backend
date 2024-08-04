import { Router } from "express";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics.controller.ts";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";

const analyticsRouter = Router();

analyticsRouter.get("/get-user-analytics",isAuthenticated, authorizeRoles("admin"), getUserAnalytics);
analyticsRouter.get("/get-order-analytics",isAuthenticated, authorizeRoles("admin"), getOrderAnalytics);
analyticsRouter.get("/get-course-analytics",isAuthenticated, authorizeRoles("admin"), getCourseAnalytics);



export default analyticsRouter