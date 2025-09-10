import { Blog } from "../models/blog.model.js";

// Create a new blog
const AddBlog = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }

    const blog = await Blog.create({
      title,
      content,
      category,
      tags,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in creating blog",
      error,
    });
  }
};

// Update a blog by ID
const UpdateBlogById = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found or not authorized" });
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      updatedBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in updating blog",
      error,
    });
  }
};

// Delete a blog by ID
const DeleteBlogById = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const deletedBlog = await Blog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found or not authorized" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in deleting blog",
      error,
    });
  }
};

// Get all blogs for the logged-in user with pagination
const GetAllBlogs = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find({ userId: req.user._id })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email");

    if (!blogs.length) {
      return res
        .status(404)
        .json({ success: false, message: "No blogs found" });
    }

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      page,
      totalPages,
      totalBlogs,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in fetching blogs",
      error,
    });
  }
};

// Get a single blog by ID (only if it belongs to logged-in user)
const GetBlogById = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const blog = await Blog.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("userId", "username email");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Blog fetched successfully", blog });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in fetching blog",
      error,
    });
  }
};

// Filter blogs by term (title, content, category, tags) for logged-in user
const FilterBlogs = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const term = req.query.term || "";

    const blogs = await Blog.find({
      userId: req.user._id,
      $or: [
        { category: { $regex: term, $options: "i" } },
        { title: { $regex: term, $options: "i" } },
        { content: { $regex: term, $options: "i" } },
        { tags: { $in: term.split(",").map((tag) => new RegExp(tag, "i")) } },
      ],
    });

    if (!blogs.length) {
      return res
        .status(404)
        .json({ success: false, message: "No blogs found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Blogs filtered successfully", blogs });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in filtering blogs",
      error,
    });
  }
};

// Filter blogs by date for logged-in user
const FilterBlogsByDate = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const date = req.query.date;
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const dateObject = new Date(date);
    dateObject.setHours(23, 59, 59, 999);

    const blogs = await Blog.find({
      userId: req.user._id,
      createdAt: { $lte: dateObject },
    });

    if (!blogs.length) {
      return res
        .status(404)
        .json({ success: false, message: "No blogs found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Blogs fetched successfully", blogs });
  } catch (error) {
    console.error("Error filtering blogs by date:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export {
  AddBlog,
  UpdateBlogById,
  DeleteBlogById,
  GetAllBlogs,
  GetBlogById,
  FilterBlogs,
  FilterBlogsByDate,
};
