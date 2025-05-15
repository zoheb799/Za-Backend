import express from "express";
import {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  addToCart,
  removeFromCart,
  getMyCart,
  clearCart,
  getMyOrders,
  updateCartQuantity,
} from "../controller/product.controller.js"
import { authenticateUser } from "../middlewares/auth.middleware.js";
import isSeller from "../middlewares/isseller.js";

const router = express.Router();

// Public routes
router.get("/all", getAllProducts);

// Authenticated routes
router.use(authenticateUser);

// Seller only fixed routes first
router.get("/my-products", isSeller, getSellerProducts);
router.post("/add", isSeller, createProduct);
router.put("/:id", isSeller, updateProduct);
router.delete("/:id", isSeller, deleteProduct);

// Cart routes
router.post("/add-to-cart/:productId", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.get("/", getMyCart);
router.delete("/clear", clearCart);
router.put("/cart/update/:productId", updateCartQuantity);

// Orders
router.get("/my-orders", getMyOrders);

// Param route last
router.get("/:id", getProductById);


export default router;
