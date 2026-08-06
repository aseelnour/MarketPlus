import { Seller } from "../../models/Seller.model";
import { Store } from "../../models/customer-system/store.customer.model";
import { Product } from "../../models/Product.model";
import {
  IStoreFilter,
  IStoreResponse,
} from "../../interfaces/customer-system/store.customer.interface";
import { Types } from "mongoose";

export class StoreService {
  async getStores(filters: IStoreFilter = {}): Promise<{
    stores: IStoreResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      category,
      search,
      isVerified,
      minRating,
      page = 1,
      limit = 12,
    } = filters;

    const query: any = { isActive: true };

    if (category) query.categories = category;
    if (minRating) query.rating = { $gte: minRating };
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const total = await Store.countDocuments(query);

    const stores = await Store.find(query)
      .populate("owner", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 })
      .exec();

    const storeResponses = await Promise.all(
      stores.map(async (store) => {
        const productsCount = await Product.countDocuments({
          storeId: store._id,
          isActive: true,
        });

        const ownerObj = store.owner as any;
        const ownerName = ownerObj?.firstName ? `${ownerObj.firstName}` : "";

        const storeResponse: any = {
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          coverImage: store.coverImage,
          category: store.categories?.[0] || "General",
          categories: store.categories,
          rating: store.rating,
          totalReviews: store.totalReviews || 0,
          productsCount,
          followersCount: Array.isArray(store.followers)
            ? store.followers.length
            : 0,
          followers: Array.isArray(store.followers)
            ? store.followers.length
            : 0,
          image: store.coverImage || store.logo,
          isVerified: store.isVerified,
          isActive: store.isActive,
          location: store.location,
          socialLinks: store.socialLinks,
          createdAt: store.createdAt,
        };

        storeResponse.ownerName = ownerName;

        return storeResponse as IStoreResponse;
      }),
    );

    return {
      stores: storeResponses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get store by ID
  async getStoreById(storeId: string): Promise<IStoreResponse | null> {
    const store = await Store.findById(storeId).populate(
      "owner",
      "firstName lastName email",
    );
    if (!store) return null;

    const productsCount = await Product.countDocuments({
      storeId: store._id,
      isActive: true,
    });

    const ownerObj = store.owner as any;
    const ownerName = ownerObj?.firstName ? `${ownerObj.firstName}` : "";

    const storeResponse: any = {
      id: store._id.toString(),
      name: store.name,
      slug: store.slug,
      description: store.description,
      logo: store.logo,
      coverImage: store.coverImage,
      category: store.categories?.[0] || "General",
      categories: store.categories,
      rating: store.rating,
      totalReviews: store.totalReviews || 0,
      productsCount,
      followersCount: Array.isArray(store.followers)
        ? store.followers.length
        : 0,
      followers: Array.isArray(store.followers) ? store.followers.length : 0,
      image: store.coverImage || store.logo,
      isVerified: store.isVerified,
      isActive: store.isActive,
      location: store.location,
      socialLinks: store.socialLinks,
      createdAt: store.createdAt,
    };

    storeResponse.ownerName = ownerName;
    return storeResponse as IStoreResponse;
  }

  async getStoreBySlug(slug: string): Promise<IStoreResponse | null> {
    const slugRegex = new RegExp(`^${slug.replace(/-/g, ".*")}$`, "i");
    const store = await Store.findOne({
      slug: slugRegex,
      isActive: true,
    }).populate("owner", "firstName lastName email");
    if (!store) return null;

    const productsCount = await Product.countDocuments({
      storeId: store._id,
      isActive: true,
    });

    const ownerObj = store.owner as any;
    const ownerName = ownerObj?.firstName ? `${ownerObj.firstName}` : "";

    const storeResponse: any = {
      id: store._id.toString(),
      name: store.name,
      slug: store.slug,
      description: store.description,
      logo: store.logo,
      coverImage: store.coverImage,
      category: store.categories?.[0] || "General",
      categories: store.categories,
      rating: store.rating,
      totalReviews: store.totalReviews || 0,
      productsCount,
      followersCount: Array.isArray(store.followers)
        ? store.followers.length
        : 0,
      followers: Array.isArray(store.followers) ? store.followers.length : 0,
      image: store.coverImage || store.logo,
      isVerified: store.isVerified,
      isActive: store.isActive,
      location: store.location,
      socialLinks: store.socialLinks,
      createdAt: store.createdAt,
    };

    storeResponse.ownerName = ownerName;
    return storeResponse as IStoreResponse;
  }

  // Follow store
  async followStore(storeId: string, customerId: string): Promise<boolean> {
    const store = await Store.findById(storeId);
    if (!store) throw new Error("Store not found");

    const alreadyFollowing = Array.isArray(store.followers)
      ? store.followers.some((id: any) => id.toString() === customerId)
      : false;

    if (alreadyFollowing) {
      store.followers = (store.followers || []).filter(
        (id: any) => id.toString() !== customerId,
      );
      await store.save();
      return false;
    } else {
      store.followers = Array.isArray(store.followers) ? store.followers : [];
      store.followers.push(new Types.ObjectId(customerId));
      await store.save();
      return true;
    }
  }

  // Get store categories
  async getCategories(): Promise<string[]> {
    const categories = await Store.distinct("categories", { isActive: true });
    return categories;
  }

  async countActiveStores(): Promise<number> {
    return Store.countDocuments({ isActive: true });
  }

  // Get featured stores
  async getFeaturedStores(limit: number = 6): Promise<IStoreResponse[]> {
    const stores = await Store.find({ isActive: true, isVerified: true })
      .populate("owner", "firstName lastName email")
      .sort({ rating: -1 })
      .limit(limit)
      .exec();

    return Promise.all(
      stores.map(async (store) => {
        const productsCount = await Product.countDocuments({
          storeId: store._id,
          isActive: true,
        });

        const ownerObj = store.owner as any;
        const ownerName = ownerObj?.firstName ? `${ownerObj.firstName}` : "";

        const storeResponse: any = {
          id: store._id.toString(),
          name: store.name,
          slug: store.slug,
          description: store.description || "",
          logo: store.logo,
          coverImage: store.coverImage,
          category: store.categories?.[0] || "General",
          categories: store.categories,
          rating: store.rating,
          totalReviews: store.totalReviews || 0,
          productsCount,
          followersCount: Array.isArray(store.followers)
            ? store.followers.length
            : 0,
          followers: Array.isArray(store.followers)
            ? store.followers.length
            : 0,
          image: store.coverImage || store.logo,
          isVerified: store.isVerified,
          isActive: store.isActive,
          location: store.location,
          socialLinks: store.socialLinks,
          createdAt: store.createdAt,
        };

        storeResponse.ownerName = ownerName;
        return storeResponse as IStoreResponse;
      }),
    );
  }
}

export const storeService = new StoreService();
