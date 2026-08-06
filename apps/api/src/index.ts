import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import adminAuthRoutes from "./routes/admin-system/auth.routes";
import adminRoutes from "./routes/admin-system/admin.routes";
import sellerAuthRoutes from "./routes/seller-system/auth.routes";
import sellerRoutes from "./routes/seller-system/seller.routes";

import customerRoutes from "./routes/customer-system/customer.routes";
import storeRoutes from "./routes/customer-system/store.customer.routes";
import productRoutes from "./routes/customer-system/product.customer.routes";
import statsRoutes from "./routes/customer-system/stats.customer.routes";
import {
  errorHandler,
  notFound,
} from "./middlewares/customer-system/error.middleware.customer";

import "./models/seller-category.model";
import "./models/Product.model";
import "./models/Order.model";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection with retry
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller/auth", sellerAuthRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/customer", customerRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/customers/stores", storeRoutes);
app.use("/api/customers/products", productRoutes);
app.use("/api/customers/stats", statsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Market API is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
