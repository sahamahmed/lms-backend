import express from 'express'
import { Router } from 'express'
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registerUser, socialLogin, updateAccessToken, updateAvatar, updatePassword, updateUserInfo, updateUserRoles } from '../controllers/user.controller.ts'
import { authorizeRoles, isAuthenticated } from '../middleware/auth.ts';

const userRouter = Router()

userRouter.post("/register", registerUser);
userRouter.post("/activate", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", updateAccessToken, isAuthenticated, logoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.post("/social-auth", socialLogin);

userRouter.get("/me", updateAccessToken, isAuthenticated, getUserInfo);
userRouter.put("/update-user-info", updateAccessToken, isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", updateAccessToken, isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar", updateAccessToken, isAuthenticated, updateAvatar);


userRouter.get("/get-all-users", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllUsers);
userRouter.put("/update-user-role", updateAccessToken, isAuthenticated, authorizeRoles("admin"), updateUserRoles);
userRouter.delete("/delete-user/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), deleteUser);


export default userRouter