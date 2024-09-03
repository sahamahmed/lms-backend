import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller.ts";
import { updateAccessToken } from "../controllers/user.controller.ts";

const layoutRouter = Router()

layoutRouter.post("/create-layout", updateAccessToken, isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRouter.put("/edit-layout", updateAccessToken, isAuthenticated, authorizeRoles("admin"), editLayout);
layoutRouter.get("/get-layout/:type", getLayoutByType);


export default layoutRouter