import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { getNotifications, updateNotification } from "../controllers/notification.controller.ts";

const notificationRouter = Router();

notificationRouter.get("/get-all-notifications", getNotifications);
notificationRouter.put("/update-notification/:id", updateNotification);


export default notificationRouter
