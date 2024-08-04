import { Response } from "express";
import { redis } from "../utils/redis.ts";
import User from "../models/user.model.ts";

export const getUserById =  async (id: string, res:Response) => {
    const userJson = await redis.get(id)
    if (userJson) {
        const user = JSON.parse(userJson)
        res.status(200).json({
          success: true,
          user,
        });
    }
    
}


export const updateUserRoleService = async (id: string, role: string,  res: Response) => {
  const user = await User.findByIdAndUpdate(id, {role:role}, {new: true})
  await redis.set(id, JSON.stringify(user))

  res.status(200).json({
    success: true,
    user
  })
}

