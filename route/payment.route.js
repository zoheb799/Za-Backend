import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
	getMyOrders,
	createPaymentIntent,
	saveOrderAfterPayment,
} from "../controller/ordercontrollers.js";

const router = express.Router();

// 🔐 Protect all routes
router.use(authenticateUser);

router.post("/create-payment-intent", createPaymentIntent);

router.post("/save-order", saveOrderAfterPayment);

router.get("/my-orders", getMyOrders);

export default router;
