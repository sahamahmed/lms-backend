import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { createOrder, getAllOrdersForAdmin, newPayment, sendStripePublishableKey } from "../controllers/order.controller.ts";
import { updateAccessToken } from "../controllers/user.controller.ts";

const orderRouter = Router();

orderRouter.post("/create-order", updateAccessToken, isAuthenticated, createOrder);
orderRouter.get("/get-all-orders", updateAccessToken, isAuthenticated, authorizeRoles("admin"), getAllOrdersForAdmin);
orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);
orderRouter.post("/payment", updateAccessToken, isAuthenticated, newPayment);



export default orderRouter
