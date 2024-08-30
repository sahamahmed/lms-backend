import express, { NextFunction, Request, Response } from 'express';
import {ErrorMiddleware} from './middleware/error.ts';
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.ts';
import courseRouter from './routes/course.routes.ts';
import orderRouter from './routes/order.routes.ts';
import notificationRouter from './routes/notification.routes.ts';
import analyticsRouter from './routes/analytics.routes.ts';
import layoutRouter from './routes/layout.routes.ts';
const app = express();

app.use(
  cors({
    origin: [
      'https://fe2d-2400-adc1-40c-3300-848e-2894-9222-b18e.ngrok-free.app',
      'http://localhost:3000'
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(ErrorMiddleware);

// app.use((err, req, res, next) => {
//   if (err instanceof ErrorHandler) {
//     return res.status(err.statusCode).json({
//       message: err.message,
//       statusCode: err.statusCode,
//     });
//   }

//   res.status(500).json({
//     message: 'Internal Server Error',
//     statusCode: 500,
//   });
// });

app.use("/api/v1", userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter)


app.get("/", (req: Request, res:Response, next:NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Hello World",
  })

  next()
});


export {app}