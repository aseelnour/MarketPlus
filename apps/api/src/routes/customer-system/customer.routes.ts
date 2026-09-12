
import { Router } from "express";
import { Product } from "../../models/Product.model";
import { Store } from "../../models/store.model";
import { Category } from "../../models/Category.model";
import { Customer } from "../../models/Customer.model";
import { Order } from "../../models/Order.model";

const router = Router();

router.get("/stores/products", async (req, res) => {
  try {
    const { category, search, limit = 12, page = 1 } = req.query;

    let filter: any = { isDeleted: false, isActive: true };

    if (category && category !== "all") {
      filter.mainCategoryId = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("storeId", "name logo")
      .populate("mainCategoryId", "name nameAr")
      .populate("sellerCategoryId", "name nameAr")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    console.error("❌ Get products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

router.get("/stores/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("_id name nameAr icon");

    res.json({
      success: true,
      data: { categories: categories || [] },
    });
  } catch (error: any) {
    console.error("❌ Get categories error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

router.get("/stores/stats", async (req, res) => {
  try {
    const activeStores = await Store.countDocuments({
      isActive: true,
      isDeleted: false,
    });

    const totalProducts = await Product.countDocuments({
      isActive: true,
      isDeleted: false,
    });

    const avgResult = await Store.aggregate([
      { $match: { isActive: true, isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const avgRating = avgResult.length > 0 ? avgResult[0].avgRating : 0;

    res.json({
      success: true,
      data: {
        activeStores: activeStores || 0,
        totalProducts: totalProducts || 0,
        avgRating: parseFloat(avgRating.toFixed(1)) || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Get stats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
});

router.get("/stores/featured", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 6;

    const stores = await Store.find({
      isActive: true,
      isVerified: true,
      isDeleted: false,
      isFeatured: true,
    })
      .populate("owner", "firstName lastName email")
      .sort({ rating: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    console.error("Get featured stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured stores",
    });
  }
});

router.get("/stores", async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;

    let filter: any = { isActive: true, isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const stores = await Store.find(filter)
      .populate("owner", "firstName lastName email")
      .sort({ rating: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      data: { stores: stores || [] },
    });
  } catch (error: any) {
    console.error("❌ Get stores error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: error.message,
    });
  }
});

router.get("/stores/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId || storeId === "undefined" || storeId === "null") {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store = await Store.findById(storeId)
      .populate("storeCategoryIds", "name nameAr icon")
      .populate("owner", "firstName lastName email");

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (store.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Store has been deleted",
        data: {
          store: {
            _id: store._id,
            name: store.name,
            isDeleted: true,
          },
        },
      });
    }

    const products = await Product.find({
      storeId: storeId,
      isActive: true,
      isDeleted: false,
    })
      .select("title price images rating discountPrice description")
      .limit(10);

    const followerCount = store.followers?.length || 0;

    res.json({
      success: true,
      data: {
        store: {
          _id: store._id,
          name: store.name,
          description: store.description,
          logo: store.logo,
          coverImage: store.coverImage,
          categories: store.storeCategoryIds || [],
          owner: store.owner,
          isVerified: store.isVerified || false,
          isActive: store.isActive || false,
          rating: store.rating || 0,
          totalReviews: store.totalReviews || 0,
          followers: followerCount,
          createdAt: store.createdAt,
        },
        products: products,
      },
    });
  } catch (error: any) {
    console.error("❌ Get store error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store",
      error: error.message,
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;

    if (!guestId) {
      return res.status(400).json({
        success: false,
        message: "Guest ID required",
      });
    }

    let customer = await Customer.findOne({ guestId });

    if (!customer) {
      const orders = await Order.find({ guestId }).sort({ createdAt: -1 });

      if (orders.length > 0) {
        const latestOrder = orders[0];
        const shippingAddress = latestOrder.shippingAddress;

        if (shippingAddress?.phone) {
          
          customer = await Customer.findOne({
            $or: [
              { phone: shippingAddress.phone },
              ...(shippingAddress.email && shippingAddress.email.trim() !== ""
                ? [{ email: shippingAddress.email }]
                : []),
            ],
          });

          if (!customer) {
            try {
              customer = new Customer({
                guestId: guestId,
                fullName: shippingAddress.fullName || "Guest",
                phone: shippingAddress.phone || "N/A",
                email: shippingAddress.email || "",
                address: {
                  street: shippingAddress.street || "",
                  city: shippingAddress.city || "",
                  state: shippingAddress.state || "",
                  country: shippingAddress.country || "",
                  zipCode: shippingAddress.zipCode || "",
                },
                orderCount: orders.length,
                totalSpent: orders.reduce(
                  (sum, order) => sum + (order.totalPrice || 0),
                  0,
                ),
                firstOrderAt:
                  orders[orders.length - 1]?.createdAt || new Date(),
                lastOrderAt: latestOrder.createdAt || new Date(),
                follow: { storeIds: [] },
              });
              await customer.save();
            } catch (saveError: any) {
              
              if (saveError.code === 11000) {
                customer = await Customer.findOne({
                  $or: [
                    { phone: shippingAddress.phone },
                    ...(shippingAddress.email &&
                    shippingAddress.email.trim() !== ""
                      ? [{ email: shippingAddress.email }]
                      : []),
                  ],
                });

                if (customer) {
                  
                  customer.guestId = guestId;
                  customer.fullName =
                    shippingAddress.fullName || customer.fullName;
                  customer.orderCount =
                    (customer.orderCount || 0) + orders.length;
                  customer.totalSpent =
                    (customer.totalSpent || 0) +
                    orders.reduce(
                      (sum, order) => sum + (order.totalPrice || 0),
                      0,
                    );
                  customer.lastOrderAt = latestOrder.createdAt || new Date();
                  await customer.save();
                }
              } else {
                throw saveError;
              }
            }
          } else {
            
            if (!customer.guestId) {
              customer.guestId = guestId;
              await customer.save();
            }
          }

          if (customer) {
            await Order.updateMany(
              { guestId, customerId: { $exists: false } },
              { customerId: customer._id },
            );
          }
        }
      }
    }

    if (!customer) {
      return res.json({
        success: true,
        data: {
          customer: null,
          orders: [],
        },
      });
    }

    const orders = await Order.find({
      $or: [{ guestId: guestId }, { customerId: customer._id }],
    }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0,
    );
    const lastOrder = orders[0]?.createdAt || new Date();

    res.json({
      success: true,
      data: {
        customer: {
          _id: customer._id,
          fullName: customer.fullName || "Guest",
          phone: customer.phone || "N/A",
          email: customer.email || "",
          orderCount: totalOrders,
          totalSpent: totalSpent,
          lastOrderAt: lastOrder,
          createdAt: customer.createdAt || new Date(),
        },
        orders: orders,
      },
    });
  } catch (error: any) {
    console.error("❌ Get customer profile error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});
export default router;
