import {
  deleteUser,
  getCurrentUser,
  updateUser,
  findUsers,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { Router } from "express";
const router = Router();
router.get("/me", verifyUser, getCurrentUser);
router.patch("/update", verifyUser, updateUser);
router.delete("/:userid", verifyUser, roleMiddleware("admin"), deleteUser);
router.get("/", verifyUser, roleMiddleware("admin"), findUsers);
export default router;
