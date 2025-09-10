import {
  loginUser,
  logoutUser,
  registerUser,
  updatePassword,
  forgetPassword,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { Router } from "express";
const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logoutUser);
router.post("/update-password", verifyUser, updatePassword);
router.post("/forget-password", forgetPassword);
router.post("/refresh", refreshAccessToken);

export default router;
