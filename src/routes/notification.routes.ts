import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { getNotifications, updateNotification } from "../controllers/notification.controller.ts";
import { updateAccessToken } from "../controllers/user.controller.ts";

const notificationRouter = Router();

notificationRouter.get("/get-all-notifications", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getNotifications);
notificationRouter.put("/update-notification/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), updateNotification);


export default notificationRouter
