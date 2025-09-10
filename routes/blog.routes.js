import { Router } from "express";
import {
  AddBlog,
  DeleteBlogById,
  UpdateBlogById,
  GetBlogById,
  GetAllBlogs,
  FilterBlogs,
  FilterBlogsByDate,
} from "../controllers/blog.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/", verifyUser, AddBlog);
router.patch("/:id", verifyUser, UpdateBlogById);
router.delete("/:id", verifyUser, DeleteBlogById);
router.get("/filter", verifyUser, FilterBlogs);
router.get("/filterbydate", verifyUser, FilterBlogsByDate);
router.get("/", verifyUser, GetAllBlogs);
router.get("/:id", verifyUser, GetBlogById);

export default router;
