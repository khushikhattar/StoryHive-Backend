import { Blog } from "../models/blog.model.js";

const AddBlog = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
      return;
    }

    const createBlog = await Blog.create({
      title,
      content,
      category,
      tags,
      userId: req.user._id,
    });

    if (!createBlog) {
      res.status(400).json({ success: false, message: "Blog not created" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: createBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in creating blog",
      error,
    });
    return;
  }
};

const UpdateBlogById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const id = req.params.id;
    const data = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }
    if (blog.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this blog",
      });
      return;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in updating blog",
      error,
    });
    return;
  }
};
const DeleteBlogById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const id = req.params.id;
    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }
    if (blog.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this blog",
      });
      return;
    }

    await Blog.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in deleting blog",
      error,
    });
  }
};
const GetAllBlogs = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({});
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await Blog.find({})
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email");
    if (!blogs.length) {
      res.status(404).json({ success: false, message: "No blogs found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      page,
      totalPages,
      totalBlogs,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in fetching blogs",
      error,
    });
    return;
  }
};

const GetBlogById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const id = req.params.id;
    const blog = await Blog.findById(id).populate("userId", "username email");

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Blog fetched successfully", blog });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in fetching blog",
      error,
    });
    return;
  }
};

const FilterBlogs = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const term = req.query.term || "";

    const blogs = await Blog.find({
      $or: [
        { category: { $regex: term, $options: "i" } },
        { title: { $regex: term, $options: "i" } },
        { content: { $regex: term, $options: "i" } },
        { tags: { $in: term.split(",").map((tag) => new RegExp(tag, "i")) } },
      ],
    });

    if (!blogs.length) {
      res.status(404).json({ success: false, message: "No blogs found" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Blogs filtered successfully", blogs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in filtering blogs",
      error,
    });
    return;
  }
};

const FilterBlogsByDate = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }
    const date = req.query.date;
    if (!date) {
      res.status(400).json({ success: false, message: "Date is required" });
      return;
    }

    const dateObject = new Date(date);
    dateObject.setHours(23, 59, 59, 999);
    const blogs = await Blog.find({
      userId: req.user._id,
      createdAt: { $lte: dateObject },
    });

    if (!blogs || blogs.length === 0) {
      res.status(404).json({ success: false, message: "No blogs found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error filtering blogs by date:", error);
    res.status(500).json({ success: false, message: "Server error", error });
    return;
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
