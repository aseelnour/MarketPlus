import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import path from "path";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import adminAuthRoutes from "./routes/admin-system/auth.routes";
import adminRoutes from "./routes/admin-system/admin.routes";
import adminStoreRoutes from "./routes/admin-system/store.routes";
import settingRoutes from "./routes/admin-system/setting.routes";

import sellerAuthRoutes from "./routes/seller-system/auth.routes";
import sellerRoutes from "./routes/seller-system/seller.routes";
import sellerStoreRoutes from "./routes/seller-system/store.routes";
import sellerMessageRoutes from "./routes/seller-system/message.routes";

import customerRoutes from "./routes/customer-system/customer.routes";
import customerStoreRoutes from "./routes/customer-system/store.routes";
import orderRoutes from "./routes/customer-system/order.routes";
import wishlistRoutes from "./routes/customer-system/wishlist.routes";
import cartRoutes from "./routes/customer-system/cart.routes";
import followRoutes from "./routes/customer-system/follow.routes";
import reviewRoutes from "./routes/customer-system/review.routes";
import messageRoutes from "./routes/customer-system/message.routes";

import "./models/seller-category.model";
import "./models/Product.model";
import "./models/Order.model";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://customer-app.pages.dev",
      "https://admin-app.pages.dev",
      "https://seller-app.pages.dev",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/stores", adminStoreRoutes);
app.use("/api/admin/settings", settingRoutes);

app.use("/api/seller/auth", sellerAuthRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/seller/stores", sellerStoreRoutes);
app.use("/api/seller/messages", sellerMessageRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/customers/stores", customerStoreRoutes);
app.use("/api/customers/wishlist", wishlistRoutes);
app.use("/api/customers/cart", cartRoutes);
app.use("/api/customers/follow", followRoutes);
app.use("/api/customers/reviews", reviewRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/messages", messageRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Market API is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
