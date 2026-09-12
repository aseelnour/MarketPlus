import mongoose from "mongoose";
import dotenv from "dotenv";
import { Seller } from "../models/Seller.model";
import { Store } from "../models/store.model";
import { Product } from "../models/Product.model";

dotenv.config();

async function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(uri, { family: 4 });

  const sellers = await Seller.find().exec();

  for (const seller of sellers) {
    const existing = await Store.findOne({ owner: seller._id }).exec();
    if (existing) {
      await Product.updateMany(
        {
          sellerId: seller._id,
          $or: [{ storeId: { $exists: false } }, { storeId: null }],
        },
        { $set: { storeId: existing._id } },
      ).exec();
      continue;
    }

    const name =
      seller.storeName ||
      `${seller.firstName || ""} ${seller.lastName || ""}`.trim() ||
      `seller-${seller._id}`;
    const slug = await slugify(name);

    const store = new Store({
      name,
      slug,
      description: seller.storeDescription || "No description",
      logo: seller.storeLogo || undefined,
      coverImage: seller.storeCover || undefined,
      category: seller.categories?.[0] || "General",
      owner: seller._id,
      rating: seller.rating || 0,
      totalReviews: 0,
      products: [],
      followers: [],
      isVerified: seller.isApproved || false,
      isActive: seller.isActive || true,
      location: {
        address: seller.address?.street || "N/A",
        city: seller.address?.city || "N/A",
        state: "N/A",
        country: seller.address?.country || "N/A",
        coordinates: {},
      },
      socialLinks: {
        facebook: seller.socialMedia?.facebook,
        instagram: seller.socialMedia?.instagram,
        twitter: seller.socialMedia?.twitter,
        website: seller.socialMedia?.whatsapp,
      },
    });

    await store.save();

    const result = await Product.updateMany(
      {
        sellerId: seller._id,
        $or: [{ storeId: { $exists: false } }, { storeId: null }],
      },
      { $set: { storeId: store._id } },
    ).exec();
    const modified =
      (result as any).modifiedCount ?? (result as any).nModified ?? 0;
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
