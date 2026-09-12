
import { Router } from "express";
import { Order } from "../../models/Order.model";
import { Cart } from "../../models/Cart.model";
import { Store } from "../../models/store.model";
import { Seller } from "../../models/Seller.model";
import { Notification } from "../../models/Notification.model";
import { Customer } from "../../models/Customer.model";
import { Conversation } from "../../models/Conversation.model";
import { Product } from "../../models/Product.model";

const router = Router();

async function findOrCreateCustomer(customerData: {
  fullName: string;
  phone: string;
  email?: string;
  address?: any;
  totalAmount?: number;
}) {
  
  let customer = await Customer.findOne({
    $or: [
      { phone: customerData.phone },
      ...(customerData.email && customerData.email.trim() !== ""
        ? [{ email: customerData.email }]
        : []),
    ],
  });

  if (customer) {
    
    customer.fullName = customerData.fullName || customer.fullName;
    customer.lastOrderAt = new Date();
    customer.orderCount = (customer.orderCount || 0) + 1;
    customer.totalSpent =
      (customer.totalSpent || 0) + (customerData.totalAmount || 0);

    if (
      customerData.email &&
      customerData.email.trim() !== "" &&
      customer.email !== customerData.email
    ) {
      customer.email = customerData.email;
    }

    if (customerData.address && Object.keys(customerData.address).length > 0) {
      customer.address = customerData.address;
    }

    await customer.save();
    return customer;
  }

  const newCustomer = new Customer({
    fullName: customerData.fullName || "Unknown",
    phone: customerData.phone || "N/A",
    email: customerData.email || "",
    address: customerData.address || {},
    orderCount: 1,
    totalSpent: customerData.totalAmount || 0,
    firstOrderAt: new Date(),
    lastOrderAt: new Date(),
  });

  try {
    await newCustomer.save();
    return newCustomer;
  } catch (error: any) {
    
    if (error.code === 11000) {
      const existingCustomer = await Customer.findOne({
        $or: [
          { phone: customerData.phone },
          ...(customerData.email && customerData.email.trim() !== ""
            ? [{ email: customerData.email }]
            : []),
        ],
      });

      if (existingCustomer) {
        
        existingCustomer.fullName =
          customerData.fullName || existingCustomer.fullName;
        existingCustomer.lastOrderAt = new Date();
        existingCustomer.orderCount = (existingCustomer.orderCount || 0) + 1;
        existingCustomer.totalSpent =
          (existingCustomer.totalSpent || 0) + (customerData.totalAmount || 0);

        if (
          customerData.email &&
          customerData.email.trim() !== "" &&
          existingCustomer.email !== customerData.email
        ) {
          existingCustomer.email = customerData.email;
        }

        if (
          customerData.address &&
          Object.keys(customerData.address).length > 0
        ) {
          existingCustomer.address = customerData.address;
        }

        await existingCustomer.save();
        return existingCustomer;
      }
    }
    throw error;
  }
}

router.get("/", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    if (!guestId) {
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });
    }

    const orders = await Order.find({ guestId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      items,
      subtotal,
      shippingCost,
      tax,
      discount,
      totalPrice,
      notes,
      customerId: providedCustomerId,
    } = req.body;

    const guestId = req.headers["x-guest-id"] as string;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a productId",
        });
      }
      if (!item.storeId || item.storeId === "unknown") {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} has no valid storeId`,
        });
      }
    }

    let customerId = providedCustomerId;

    if (!customerId) {
      const customerData = {
        fullName: shippingAddress?.fullName || "Unknown",
        phone: shippingAddress?.phone || "N/A",
        email: shippingAddress?.email || "",
        address: {
          street: shippingAddress?.street || "",
          city: shippingAddress?.city || "",
          state: shippingAddress?.state || "",
          country: shippingAddress?.country || "",
          zipCode: shippingAddress?.zipCode || "",
        },
        totalAmount: totalPrice || 0,
      };

      const customer = await findOrCreateCustomer(customerData);
      customerId = customer._id;
    }

    const customer = await Customer.findById(customerId);

    const groupedByStore: Record<string, any[]> = {};
    items.forEach((item: any) => {
      const storeId = item.storeId;
      if (!groupedByStore[storeId]) {
        groupedByStore[storeId] = [];
      }
      groupedByStore[storeId].push(item);
    });

    const createdOrders = [];
    const notificationsToSend = [];

    for (const [storeId, storeItems] of Object.entries(groupedByStore)) {
      
      const store = await Store.findById(storeId);
      if (!store) {
        console.error(`❌ Store not found: ${storeId}`);
        return res.status(400).json({
          success: false,
          message: `Store ${storeId} not found`,
        });
      }

      const seller = await Seller.findOne({ _id: store.owner });

      const orderItems = await Promise.all(
        storeItems.map(async (item: any) => {
          
          const product = await Product.findById(item.productId);
          if (!product) {
            console.error(`❌ Product not found: ${item.productId}`);
            throw new Error(`Product ${item.productId} not found`);
          }

          return {
            productId: item.productId,
            sellerId: product.sellerId || seller?._id || null,
            storeId: storeId,
            title: product.title || item.title || "Unknown Product",
            quantity: item.quantity,
            price: item.price || product.price || 0,
            total: (item.price || product.price || 0) * item.quantity,
            isDeleted: false,
          };
        }),
      );

      const storeTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const orderNumber = `ORD-${year}${month}${day}-${random}`;

      const orderData: any = {
        orderNumber,
        guestId: req.headers["x-guest-id"] as string,
        customerId,
        storeId: storeId,
        items: orderItems,
        subtotal: storeTotal,
        shippingCost: shippingCost || 0,
        tax: tax || 0,
        discount: discount || 0,
        totalPrice:
          storeTotal + (shippingCost || 0) + (tax || 0) - (discount || 0),
        shippingAddress: {
          fullName: shippingAddress?.fullName || "Unknown",
          phone: shippingAddress?.phone || "N/A",
          email: shippingAddress?.email || "",
          street: shippingAddress?.street || "N/A",
          city: shippingAddress?.city || "N/A",
          state: shippingAddress?.state || "N/A",
          country: shippingAddress?.country || "N/A",
          zipCode: shippingAddress?.zipCode || "N/A",
        },
        paymentMethod: paymentMethod || "cash",
        status: "pending",
        paymentStatus: "pending",
        notes: notes || "",
      };

      const order = new Order(orderData);
      await order.save();
      createdOrders.push(order);

      notificationsToSend.push({
        storeId,
        orderNumber,
        storeName: store.name,
      });
    }

    for (const notif of notificationsToSend) {
      try {
        
        const store = await Store.findById(notif.storeId);
        if (store) {
          const seller = await Seller.findOne({ _id: store.owner });
          if (seller) {
            const notification = new Notification({
              sellerId: seller._id,
              storeId: notif.storeId,
              storeName: notif.storeName || store.name,
              type: "new_order",
              message: `New order #${notif.orderNumber} placed in "${notif.storeName || store.name}"`,
              isRead: false,
            });
            await notification.save();
          }
        }
      } catch (error) {
        console.error("❌ Failed to send notification:", error);
      }
    }

    res.status(201).json({
      success: true,
      message: `Orders placed successfully (${createdOrders.length} orders)`,
      data: { orders: createdOrders },
    });
  } catch (error: any) {
    console.error("🔥 Order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create orders",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const guestId = req.headers["x-guest-id"] as string;

    const order = await Order.findById(orderId).populate({
      path: "items.productId",
      select: "title price images discountPrice",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.guestId !== guestId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const formattedOrder = {
      ...order.toObject(),
      items: order.items.map((item: any) => ({
        ...item.toObject(),
        image: item.productId?.images?.[0] || null,
      })),
    };

    res.json({
      success: true,
      data: { order: formattedOrder },
    });
  } catch (error: any) {
    console.error("❌ Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
});

export default router;
