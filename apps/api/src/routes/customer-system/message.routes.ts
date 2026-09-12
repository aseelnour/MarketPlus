import { Router } from "express";
import { Conversation } from "../../models/Conversation.model";
import { Message } from "../../models/Message.model";
import { Customer } from "../../models/Customer.model";
import { Order } from "../../models/Order.model";
import { Store } from "../../models/store.model";
import { Seller } from "../../models/Seller.model";
import { sellerAuthMiddleware } from "../../middlewares/sellerAuth.middleware";

const router = Router();

router.get("/customer/conversations", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;

    if (!guestId) {
      return res.json({ success: true, data: { conversations: [] } });
    }

    let customer = await Customer.findOne({ guestId });

    if (!customer) {
      const order = await Order.findOne({ guestId });
      if (order && order.customerId) {
        customer = await Customer.findById(order.customerId);
      }
    }

    if (!customer) {
      return res.json({ success: true, data: { conversations: [] } });
    }

    const conversations = await Conversation.find({
      customerId: customer._id,
      status: "active",
    }).sort({ lastMessageAt: -1 });

    res.json({ success: true, data: { conversations } });
  } catch (error: any) {
    console.error("❌ Get customer conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
});

router.get(
  "/seller/conversations",
  sellerAuthMiddleware,
  async (req: any, res) => {
    try {
      const conversations = await Conversation.find({
        sellerId: req.seller._id,
        status: "active",
      }).sort({ lastMessageAt: -1 });

      res.json({ success: true, data: { conversations } });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch conversations" });
    }
  },
);

router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, userType } = req.query;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    if (userType === "customer") {
      await Conversation.findByIdAndUpdate(conversationId, {
        unreadCustomer: 0,
      });
    } else if (userType === "seller") {
      await Conversation.findByIdAndUpdate(conversationId, {
        unreadSeller: 0,
      });
    }

    res.json({ success: true, data: { messages } });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
});

router.post("/:orderId/messages", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const guestId = req.headers["x-guest-id"] as string;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let customer = await Customer.findOne({ guestId });
    if (!customer) {
      if (order.shippingAddress?.phone) {
        customer = await Customer.findOne({
          phone: order.shippingAddress.phone,
        });
      }

      if (!customer && order.shippingAddress) {
        customer = new Customer({
          guestId: guestId,
          fullName: order.shippingAddress.fullName || "Guest",
          phone: order.shippingAddress.phone || "N/A",
          email: order.shippingAddress.email || "",
          address: {
            street: order.shippingAddress.street || "",
            city: order.shippingAddress.city || "",
            state: order.shippingAddress.state || "",
            country: order.shippingAddress.country || "",
            zipCode: order.shippingAddress.zipCode || "",
          },
        });
        await customer.save();
      }
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const store = await Store.findById(order.storeId);
    const seller = await Seller.findOne({ _id: store?.owner });

    if (!seller || !store) {
      return res.status(404).json({
        success: false,
        message: "Store or seller not found",
      });
    }

    let conversation = await Conversation.findOne({ orderId: order._id });

    if (!conversation) {
      conversation = new Conversation({
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerId: customer._id,
        sellerId: seller._id,
        storeId: store._id,
        storeName: store.name,
        customerName:
          customer.fullName || order.shippingAddress?.fullName || "Customer",
        customerPhone: customer.phone || order.shippingAddress?.phone || "N/A",
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        unreadCustomer: 0,
        unreadSeller: 1,
        status: "active",
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      senderId: guestId,
      senderType: "customer",
      content: content.trim(),
      isRead: false,
    });
    await message.save();

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
      $inc: { unreadSeller: 1 },
    });

    res.json({
      success: true,
      data: { message, conversation: conversation._id },
    });
  } catch (error: any) {
    console.error("❌ Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

export default router;
