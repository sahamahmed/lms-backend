import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.ts";
import { createOrder, getAllOrdersForAdmin, newPayment, sendStripePublishableKey } from "../controllers/order.controller.ts";

const orderRouter = Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.get("/get-all-orders",isAuthenticated, authorizeRoles("admin"), getAllOrdersForAdmin);
orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);
orderRouter.post("/payment", isAuthenticated, newPayment);



export default orderRouter
