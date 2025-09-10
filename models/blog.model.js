import mongoose, { Schema } from "mongoose";

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", BlogSchema);
