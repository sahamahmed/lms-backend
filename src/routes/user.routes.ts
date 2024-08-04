import express from 'express'
import { Router } from 'express'
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registerUser, socialLogin, updateAccessToken, updateAvatar, updatePassword, updateUserInfo, updateUserRoles } from '../controllers/user.controller.ts'
import { authorizeRoles, isAuthenticated } from '../middleware/auth.ts';

const userRouter = Router()

userRouter.post("/register", registerUser);
userRouter.post("/activate", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout",isAuthenticated, logoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.post("/social-auth", socialLogin);

userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar", isAuthenticated, updateAvatar);


userRouter.get("/get-all-users",isAuthenticated, authorizeRoles("admin"), getAllUsers);
userRouter.put("/update-user-role", isAuthenticated, authorizeRoles("admin"), updateUserRoles);
userRouter.delete("/delete-user/:id",isAuthenticated, authorizeRoles("admin"), deleteUser);


export default userRouter