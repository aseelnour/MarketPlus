import { Product } from "../../models/Product.model";
import { Category } from "../../models/Category.model";
import { SellerCategory } from "../../models/seller-category.model";
import {
  IProductFilter,
  IProductResponse,
} from "../../interfaces/product.interface";

export class ProductService {
  // Get products with filters
  async getProducts(filters: IProductFilter = {}): Promise<{
    products: IProductResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      sellerId,
      storeId,
      category,
      mainCategoryId,
      sellerCategoryId,
      search,
      minPrice,
      maxPrice,
      isActive = true,
      isFeatured,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 12,
    } = filters;

    const query: any = { isDeleted: false };

    if (storeId) query.storeId = storeId;
    else if (sellerId) query.sellerId = sellerId;

    if (category) {
      const categoryDoc = await Category.findOne({
        name: category,
        isActive: true,
        isDeleted: false,
      });

      if (categoryDoc) {
        query.mainCategoryId = categoryDoc._id;
      }
    }

    if (mainCategoryId) query.mainCategoryId = mainCategoryId;
    if (sellerCategoryId) query.sellerCategoryId = sellerCategoryId;
    if (isActive !== undefined) query.isActive = isActive;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("sellerId", "firstName lastName storeName")
      .populate("storeId", "name slug logo coverImage")
      .populate("mainCategoryId", "name")
      .populate("sellerCategoryId", "name")
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .exec();

    const productResponses = products.map((product) => {
      const sellerObj: any = product.sellerId || {};
      const storeObj: any = product.storeId || null;
      const mainCategoryObj: any = product.mainCategoryId || {};
      return {
        id: product._id.toString(),
        title: product.title,
        name: product.title,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: product.quantity,
        brand: product.brand,
        images: product.images,
        image:
          Array.isArray(product.images) && product.images.length
            ? product.images[0]
            : undefined,
        rating: product.rating,
        reviews: 0,
        tag: product.isFeatured ? "Sale" : undefined,
        seller: {
          id: sellerObj._id ? sellerObj._id.toString() : undefined,
          name: storeObj?.name
            ? storeObj.name
            : sellerObj.storeName ||
              `${sellerObj.firstName || ""} ${sellerObj.lastName || ""}`.trim(),
        },
        store: storeObj
          ? {
              id: storeObj._id ? storeObj._id.toString() : undefined,
              name: storeObj.name,
              slug: storeObj.slug,
              image: storeObj.coverImage || storeObj.logo,
            }
          : undefined,
        category: {
          id: mainCategoryObj._id ? mainCategoryObj._id.toString() : undefined,
          name: mainCategoryObj.name,
        },
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        views: product.views,
        createdAt: product.createdAt,
      };
    });

    return {
      products: productResponses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get product by ID
  async getProductById(productId: string): Promise<IProductResponse | null> {
    const product = await Product.findById(productId)
      .populate("sellerId", "firstName lastName storeName email")
      .populate("storeId", "name slug logo coverImage")
      .populate("mainCategoryId", "name")
      .populate("sellerCategoryId", "name")
      .exec();

    if (!product || product.isDeleted) return null;

    // Increment views
    product.views += 1;
    await product.save();

    const sellerObj: any = product.sellerId || {};
    const storeObj: any = product.storeId || null;
    const mainCategoryObj: any = product.mainCategoryId || {};

    return {
      id: product._id.toString(),
      title: product.title,
      name: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      quantity: product.quantity,
      brand: product.brand,
      images: product.images,
      image:
        Array.isArray(product.images) && product.images.length
          ? product.images[0]
          : undefined,
      rating: product.rating,
      reviews: 0,
      tag: product.isFeatured ? "Sale" : undefined,
      seller: {
        id: sellerObj._id ? sellerObj._id.toString() : undefined,
        name: storeObj?.name
          ? storeObj.name
          : sellerObj.storeName ||
            `${sellerObj.firstName || ""} ${sellerObj.lastName || ""}`.trim(),
      },
      store: storeObj
        ? {
            id: storeObj._id ? storeObj._id.toString() : undefined,
            name: storeObj.name,
            slug: storeObj.slug,
            image: storeObj.coverImage || storeObj.logo,
          }
        : undefined,
      category: {
        id: mainCategoryObj._id ? mainCategoryObj._id.toString() : undefined,
        name: mainCategoryObj.name,
      },
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      views: product.views,
      createdAt: product.createdAt,
    };
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<IProductResponse[]> {
    const products = await Product.find({
      isDeleted: false,
      isActive: true,
      isFeatured: true,
    })
      .populate("sellerId", "firstName lastName storeName")
      .populate("storeId", "name slug logo coverImage")
      .populate("mainCategoryId", "name")
      .sort({ rating: -1, views: -1 })
      .limit(limit)
      .exec();

    return products.map((product) => {
      const sellerObj: any = product.sellerId || {};
      const storeObj: any = product.storeId || null;
      const mainCategoryObj: any = product.mainCategoryId || {};
      return {
        id: product._id.toString(),
        title: product.title,
        name: product.title,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: product.quantity,
        brand: product.brand,
        images: product.images,
        image:
          Array.isArray(product.images) && product.images.length
            ? product.images[0]
            : undefined,
        rating: product.rating,
        reviews: 0,
        tag: product.isFeatured ? "Sale" : undefined,
        seller: {
          id: sellerObj._id ? sellerObj._id.toString() : undefined,
          name: storeObj?.name
            ? storeObj.name
            : sellerObj.storeName ||
              `${sellerObj.firstName || ""} ${sellerObj.lastName || ""}`.trim(),
        },
        store: storeObj
          ? {
              id: storeObj._id ? storeObj._id.toString() : undefined,
              name: storeObj.name,
              slug: storeObj.slug,
              image: storeObj.coverImage || storeObj.logo,
            }
          : undefined,
        category: {
          id: mainCategoryObj._id ? mainCategoryObj._id.toString() : undefined,
          name: mainCategoryObj.name,
        },
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        views: product.views,
        createdAt: product.createdAt,
      };
    });
  }

  // Product statistics
  async countActiveProducts(): Promise<number> {
    return Product.countDocuments({ isDeleted: false, isActive: true });
  }

  async getAverageProductRating(): Promise<number> {
    const result = await Product.aggregate([
      { $match: { isDeleted: false, isActive: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);
    return result?.[0]?.avgRating ?? 0;
  }

  async getCategories(): Promise<string[]> {
    return Category.find({ isActive: true })
      .sort({ name: 1 })
      .distinct("name")
      .exec();
  }

  async getSubcategories(category: string): Promise<string[]> {
    if (!category) return [];
    const mainCategory = await Category.findOne({
      name: category,
      isActive: true,
      isDeleted: false,
    }).exec();
    if (!mainCategory) return [];
    return SellerCategory.find({
      mainCategoryId: mainCategory._id,
      isActive: true,
      isDeleted: false,
    })
      .sort({ name: 1 })
      .distinct("name")
      .exec();
  }

  // Get products by seller
  async getProductsBySeller(
    sellerId: string,
    filters: IProductFilter = {},
  ): Promise<{
    products: IProductResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getProducts({ ...filters, sellerId });
  }

  // Get products by store
  async getProductsByStore(
    storeId: string,
    filters: IProductFilter = {},
  ): Promise<{
    products: IProductResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getProducts({ ...filters, storeId });
  }

  // Search products
  async searchProducts(
    searchTerm: string,
    limit: number = 20,
  ): Promise<IProductResponse[]> {
    const products = await Product.find(
      { $text: { $search: searchTerm }, isDeleted: false, isActive: true },
      { score: { $meta: "textScore" } },
    )
      .populate("sellerId", "firstName lastName storeName")
      .populate("storeId", "name slug logo coverImage")
      .populate("mainCategoryId", "name")
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .exec();

    return products.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      quantity: product.quantity,
      brand: product.brand,
      images: product.images,
      rating: product.rating,
      seller: {
        id: (product.sellerId as any)._id.toString(),
        name:
          (product.storeId as any)?.name ||
          (product.sellerId as any).storeName ||
          `${(product.sellerId as any).firstName} ${(product.sellerId as any).lastName}`,
      },
      store: (product.storeId as any)
        ? {
            id: (product.storeId as any)._id.toString(),
            name: (product.storeId as any).name,
            slug: (product.storeId as any).slug,
            image:
              (product.storeId as any).coverImage ||
              (product.storeId as any).logo,
          }
        : undefined,
      category: {
        id: (product.mainCategoryId as any)._id.toString(),
        name: (product.mainCategoryId as any).name,
      },
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      views: product.views,
      createdAt: product.createdAt,
    }));
  }
}

export const productService = new ProductService();
