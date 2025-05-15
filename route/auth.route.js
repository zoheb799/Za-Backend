import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  profileUpdate,
} from "../controller/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/logout", authenticateUser, logoutUser);

router.get("/profile", authenticateUser, (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

router.put("/profile", authenticateUser, profileUpdate);





export default router;
