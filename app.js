import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin:["http://localhost:5173", "https://zeigler-ecommerce.vercel.app","https://zeigler-ecommerce-2a15cr645-zoheb799s-projects.vercel.app"],
		credentials: true,
	})
);

import authRouter from "./route/auth.route.js";
import messageRouter from "./route/message.route.js";
import productRouter from "./route/product.route.js";
import orderRouter from "./route/payment.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/orders", orderRouter);

export default app;
