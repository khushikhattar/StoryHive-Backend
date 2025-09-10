import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Blog } from "../models/blog.model.js";

// ========================
// Register User
// ========================
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
      return res
        .status(409)
        .json({ message: "User with username or email exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    return res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while creating user" });
  }
};

// ========================
// Login User
// ========================
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res
        .status(400)
        .json({ success: false, message: "Provide username or email" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = { httpOnly: true, secure: true };

    const sanitizedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: sanitizedUser,
        accessToken,
      });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while logging in" });
  }
};

// ========================
// Logout User
// ========================
const logoutUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true, timestamps: false }
    );

    const cookieOptions = { httpOnly: true, secure: true };
    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while logging out" });
  }
};

// ========================
// Refresh Access Token
// ========================
const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken)
      return res.status(400).json({ message: "No refresh token provided" });

    const user = await User.findOne({ refreshToken: oldRefreshToken });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token" });

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (decoded._id !== user._id.toString())
      return res.status(403).json({ message: "Token user mismatch" });

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    const cookieOptions = { httpOnly: true, secure: true };

    return res
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .status(200)
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res
      .status(403)
      .json({ message: "Refresh token expired or invalid" });
  }
};

// ========================
// Update User
// ========================
const updateUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "User not authenticated" });
    if (!Object.keys(req.body).length)
      return res.status(400).json({ message: "No fields to update" });

    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.name) updates.name = req.body.name;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user)
      return res.status(400).json({ message: "Failed to update user" });

    return res
      .status(200)
      .json({ success: true, message: "User updated", user });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating user" });
  }
};

// ========================
// Delete User
// ========================
const deleteUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "User not authenticated" });
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const userId = req.params.userid;
    if (req.user._id.toString() === userId)
      return res
        .status(400)
        .json({ message: "Admins cannot delete themselves" });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting user" });
  }
};

// ========================
// Find Users (Admin Only)
// ========================
const findUsers = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "User not authenticated" });
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find({ role: "user" })
      .skip(skip)
      .limit(limit)
      .select("-password -refreshToken")
      .populate("Blogs");

    if (!users || !users.length)
      return res.status(404).json({ message: "No users found" });

    return res
      .status(200)
      .json({ success: true, page, totalPages, totalUsers, users });
  } catch (error) {
    console.error("Error finding users:", error);
    return res
      .status(500)
      .json({ message: "Server error while finding users" });
  }
};

// ========================
// Get Current User
// ========================
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "User not authenticated" });

    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching user" });
  }
};

// ========================
// Update Password
// ========================
const updatePassword = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "User not authenticated" });

    const { newpassword } = req.body;
    if (!newpassword || newpassword.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    await User.findByIdAndUpdate(req.user._id, {
      $set: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating password" });
  }
};

// ========================
// Forget Password
// ========================
const forgetPassword = async (req, res) => {
  try {
    const { username, email, newpassword } = req.body;
    if (!username && !email)
      return res.status(400).json({ message: "Provide username or email" });

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!newpassword || newpassword.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Server error while resetting password" });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUser,
  deleteUser,
  findUsers,
  getCurrentUser,
  updatePassword,
  forgetPassword,
};
