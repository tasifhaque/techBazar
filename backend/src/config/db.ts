import mongoose from "mongoose";

let cached: mongoose.Connection | null = null;

export async function connectDB() {
  if (cached) return cached;
  const uri = process.env.MONGODB_URI!;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    cached = mongoose.connection;
    console.log("MongoDB connected successfully");
    return cached;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
