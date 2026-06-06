import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from environment variables");
}

// Cache the connection across serverless cold starts
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
