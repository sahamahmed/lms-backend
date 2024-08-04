import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import ErrorHandler from "../utils/ErrorHandler.ts";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import sendMail from "../utils/sendMail.ts";
import cloudinary from "cloudinary"
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt.ts";
import { redis } from "../utils/redis.ts";
import { CustomRequest, RedisUser } from "../middleware/auth.ts";
import dotenv from "dotenv";
import { getUserById, updateUserRoleService } from "../services/user.service.ts";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.__dirname = __dirname;  

//REGISTRATION
interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "10m" }
  );
  return { token, activationCode };
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
      }
      const user: IRegisterUser = { name, email, password };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Account Activation",
          template: "activation-mail.ejs",
          data,
        });
        res.status(200).json({
          success: true,
          message: "Please check your email to activate your account",
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


//ACTIVATION OF USER ACCOUNT
interface IActivation{
    activationToken: string;
    activationCode: string;
}

export const activateUser = asyncHandler(
    async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { activationToken, activationCode } = req.body as IActivation;
            if(!activationToken || !activationCode){
                return next(new ErrorHandler("Invalid activation token", 400));
            }
            const newUser: {
                user: IUser;
                activationCode: string;
            } = jwt.verify(activationToken, process.env.ACTIVATION_SECRET as string) as {
                user: IUser;
                activationCode: string;
            };

            if (newUser.activationCode !== activationCode) {
                return next(new ErrorHandler("Invalid activation token", 400));
            }

            const {name, email, password} = newUser.user
            const existingUser = await User.findOne({email})
            if (existingUser) {
                return next(new ErrorHandler("User already exists", 400));
            }

            const user = await User.create({
                name,
                email,
                password,
                isVerified: true,
            });

            res.status(201).json({
                success: true,
                user,
                message: "Account activated successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
)


//LOGIN
interface ILoginUser {
    email: string;
    password: string;
}

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   try {
     const { email, password } = req.body as ILoginUser;
     if (!email || !password) {
         return next(new ErrorHandler("Please enter email and password", 400));
     }
 
     const user = await User.findOne({ email }).select("+password")

     if (!user) {
         return next(new ErrorHandler("Invalid email or password", 401));
     }
     const isPasswordCorrect = await user.comparePassword(password)
     if (!isPasswordCorrect) {
         return next(new ErrorHandler("Invalid email or password", 401));
     }

      sendToken(user, 200, res)  

   } catch (error:any) {
     return next(new ErrorHandler(error.message, 500));
   }
})


//LOGOUT
export const logoutUser = asyncHandler(async (req: Request & { user: IUser }, res: Response, next: NextFunction) => {
    try {
      res.cookie("refresh_token", "", {maxAge: 1});
      res.cookie("access_token", "", {maxAge: 1});
      const user = req.user; 
      if (user && user._id) {
        await redis.del(user._id);
      }
      res.status(200).json({ success: true, message: "Logged out" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
})


//UPDATE ACCESS TOKEN
  export const updateAccessToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {  
    try {
     const refreshtoken = req.cookies.refresh_token;
     const decoded = jwt.verify(
       refreshtoken,
       process.env.REFRESH_TOKEN as string
     ) as JwtPayload;
     const message = 'Could not update access token'
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }

      const session = await redis.get(decoded.id);
      if (!session) {
        return next(new ErrorHandler('Please Login to access this resource', 400));
      }

      const user = JSON.parse(session)
      const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
        expiresIn: "5m",
      });

      const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
        expiresIn: "3d",
      });

    (req as CustomRequest).user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);
      redis.set(user._id, JSON.stringify(user), "EX" , 604800)
    
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error:any) {
      return next(new ErrorHandler(error.message, 500));
    }
  })

  //GET USER INFO
export const getUserInfo = asyncHandler(async (req: Request & { user: IUser }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res)
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  })


// SOCIAL AUTH
interface ISocialLogin {
    email: string;
    name: string;
    avatar: string;
  }

export const socialLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
     const {email, name , avatar} = req.body as ISocialLogin
     const user = await User.findOne({email})
     if(!user){
        const newUser = await User.create({
          name,
          email,
          avatar,
        })
        sendToken(newUser, 200, res)
     } else{
        sendToken(user, 200, res)
     }

    }catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  })

//UPDATE USER INFO
interface IUpdateUser {
    name: string;
    email: string;
  }

export const updateUserInfo = asyncHandler(async (req: Request & { user: IUser }, res: Response, next: NextFunction) => {
    try {
      const {name} = req.body as IUpdateUser;
      const userId = req.user?._id;
      const user = await User.findById(userId);

      if (name && user) {
          user.name = name;       
        }

      await user.save();
      await redis.set(userId, JSON.stringify(user))
      
      res.status(200).json({
        success: true,
        user,
      });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  })

  //UPDATE PASSWORD
  interface IUpdatePassword {
    currentPassword: string;
    newPassword: string;
  }

  export const updatePassword = asyncHandler(async (req: Request & { user: IUser }, res: Response, next: NextFunction) => {
    try {
      const {currentPassword, newPassword} = req.body as IUpdatePassword
      if (!currentPassword || !newPassword) {
        return next(new ErrorHandler("Please enter current and new password", 400));
      }
      const userId = req.user._id
      const user = await User.findById(userId).select("+password")
      if (user.password == undefined) {
        return next(new ErrorHandler("Invalid user", 400))
      }
      const isPasswordCorrect = await user.comparePassword(currentPassword)
      if (!isPasswordCorrect) {
        throw new ErrorHandler("Invalid password", 400)
      }
      user.password = newPassword

      await user.save()
      await redis.set(userId, JSON.stringify(user))

      return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  })

// update avatar
interface IUpdateAvatar {
  avatar: string
}

export const updateAvatar = asyncHandler(async (req: Request & { user: IUser }, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body as IUpdateAvatar;
    const userId = req.user._id;

    const user = await User.findById(userId)
    
    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } else {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
    }

    await user.save();
    await redis.set(userId, JSON.stringify(user))

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
})


// ADMIN ROUTES

export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const users = await User.find().sort({createdAt: -1})
    res.status(200).json({
      success: true,
      users
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
})

export const updateUserRoles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {id, role} = req.body
    updateUserRoleService(id, role, res)
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
})

export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id
    const user = await User.findByIdAndDelete(userId)
    const userAvatar = user?.avatar?.public_id

    //removing user avatar from cloudinary
    if(userAvatar){
      await cloudinary.v2.uploader.destroy(userAvatar)
    }

    if(!user){
      return next(new ErrorHandler("User not found", 404))
    }

    await redis.del(userId)

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    })

    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
})