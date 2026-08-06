import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../models/Category.model";

dotenv.config();

const categories = [
  { name: "Electronics", nameAr: "إلكترونيات", icon: "📱", isActive: true },
  { name: "Clothing", nameAr: "ملابس", icon: "👕", isActive: true },
  { name: "Makeup", nameAr: "مكياج", icon: "💄", isActive: true },
  { name: "Cars", nameAr: "سيارات", icon: "🚗", isActive: true },
  { name: "Books", nameAr: "كتب", icon: "📚", isActive: true },
  { name: "Food", nameAr: "طعام", icon: "🍕", isActive: true },
  { name: "Sports", nameAr: "رياضة", icon: "⚽", isActive: true },
  { name: "Toys", nameAr: "ألعاب", icon: "🧸", isActive: true },
  { name: "Furniture", nameAr: "أثاث", icon: "🛋️", isActive: true },
  { name: "Health", nameAr: "صحة", icon: "💊", isActive: true },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to MongoDB");

    // حذف الفئات القديمة (اختياري)
    await Category.deleteMany({});
    console.log("🗑️ Old categories cleared");

    // إدخال الفئات الجديدة
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ ${insertedCategories.length} categories inserted`);

    // عرض الفئات المضافة
    console.log("\n📋 Categories added:");
    insertedCategories.forEach((cat) => {
      console.log(`   - ${cat.icon} ${cat.name} (${cat.nameAr})`);
    });

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedCategories();
