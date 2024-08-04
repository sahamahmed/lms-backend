import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller.ts";

const layoutRouter = Router()

layoutRouter.post("/create-layout", isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRouter.put("/edit-layout", isAuthenticated, authorizeRoles("admin"), editLayout);
layoutRouter.get("/get-layout", isAuthenticated, getLayoutByType);


export default layoutRouter