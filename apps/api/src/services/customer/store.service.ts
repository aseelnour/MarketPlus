import { Store } from "../../models/store.model";
import { Product } from "../../models/Product.model";
import { Category } from "../../models/Category.model";
import mongoose from "mongoose";

export class CustomerStoreService {
  
  async getAllStores(filters: any = {}) {
    const { search, limit = 20, page = 1 } = filters;

    let query: any = { isActive: true, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      Store.find(query)
        .populate("owner", "firstName lastName email")
        .sort({ rating: -1 })
        .limit(limit)
        .skip(skip),
      Store.countDocuments(query),
    ]);

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getFeaturedStores(limit: number = 6) {
    const stores = await Store.find({
      isActive: true,
      isVerified: true,
      isDeleted: false,
    })
      .populate("owner", "firstName lastName email")
      .sort({ rating: -1 })
      .limit(limit);

    return stores;
  }

  async getAllProducts(filters: any = {}) {
    const { category, search, limit = 12, page = 1 } = filters;

    let query: any = { isActive: true, isDeleted: false };

    if (category && category !== "all") {
      query.mainCategoryId = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("storeId", "name logo")
        .populate("mainCategoryId", "name nameAr")
        .populate("sellerCategoryId", "name nameAr")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getStoreBySlug(slug: string) {
    const store = await Store.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
      isDeleted: false,
    }).populate("owner", "firstName lastName email");

    return store;
  }

  async getCategories() {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    return categories;
  }
}

export const customerStoreService = new CustomerStoreService();
