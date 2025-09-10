import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.URI);
    if (connection) {
      console.log("Connected to database successfully");
    } else {
      console.log("Error connecting to database");
    }
  } catch (error) {
    console.error("MongoDB Connected failed", error);
    process.exit(1);
  }
};
