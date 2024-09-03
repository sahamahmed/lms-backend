import { Router } from "express";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics.controller.ts";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { updateAccessToken } from "../controllers/user.controller.ts";

const analyticsRouter = Router();

analyticsRouter.get("/get-user-analytics", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getUserAnalytics);
analyticsRouter.get("/get-order-analytics", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getOrderAnalytics);
analyticsRouter.get("/get-course-analytics", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getCourseAnalytics);



export default analyticsRouter