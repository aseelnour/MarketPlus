import { Router } from "express";
import { sellerAuthMiddleware } from "../../middlewares/sellerAuth.middleware";
import { Conversation } from "../../models/Conversation.model";
import { Message } from "../../models/Message.model";
import { Customer } from "../../models/Customer.model";
import { Order } from "../../models/Order.model";

const router = Router();

router.get("/customer/conversations", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;

    if (!guestId) {
      return res.json({ success: true, data: { conversations: [] } });
    }

    let customer = await Customer.findOne({ guestId });

    if (!customer) {
      const order = await Order.findOne({ guestId }).sort({ createdAt: -1 });

      if (order && order.shippingAddress?.phone) {
        customer = await Customer.findOne({
          phone: order.shippingAddress.phone,
        });

        if (customer) {
          customer.guestId = guestId;
          await customer.save();
        }
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
      const sellerId = req.seller._id;
      const storeId = req.query.storeId as string;

      const filter: any = {
        sellerId: sellerId,
        status: "active",
      };

      if (storeId) {
        filter.storeId = storeId;
      }

      const conversations = await Conversation.find(filter).sort({
        lastMessageAt: -1,
      });

      res.json({ success: true, data: { conversations } });
    } catch (error: any) {
      console.error("❌ Get seller conversations error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch conversations",
        error: error.message,
      });
    }
  },
);

router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const guestId = req.headers["x-guest-id"] as string;
    const userType = (req.query.userType as string) || "customer";

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (userType === "customer") {
      let customer = await Customer.findOne({ guestId });

      if (!customer) {
        const order = await Order.findOne({ guestId }).sort({ createdAt: -1 });
        if (order && order.shippingAddress?.phone) {
          customer = await Customer.findOne({
            phone: order.shippingAddress.phone,
          });
          if (customer) {
            customer.guestId = guestId;
            await customer.save();
          }
        }
      }

      if (
        !customer ||
        conversation.customerId.toString() !== customer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    if (userType === "customer") {
      await Conversation.findByIdAndUpdate(conversationId, {
        unreadCustomer: 0,
      });
    }

    res.json({ success: true, data: { messages } });
  } catch (error: any) {
    console.error("❌ Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

router.post("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, senderId, senderType } = req.body;
    const guestId = req.headers["x-guest-id"] as string;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (senderType === "customer") {
      let customer = await Customer.findOne({ guestId });

      if (!customer) {
        const order = await Order.findOne({ guestId }).sort({ createdAt: -1 });
        if (order && order.shippingAddress?.phone) {
          customer = await Customer.findOne({
            phone: order.shippingAddress.phone,
          });
          if (customer) {
            customer.guestId = guestId;
            await customer.save();
          }
        }
      }

      if (
        !customer ||
        conversation.customerId.toString() !== customer._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    const message = new Message({
      conversationId,
      senderId: senderId || guestId,
      senderType: senderType || "customer",
      content: content.trim(),
      isRead: false,
    });
    await message.save();

    const updateData: any = {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
    };

    if (senderType === "customer") {
      updateData.unreadSeller = (conversation.unreadSeller || 0) + 1;
    } else if (senderType === "seller") {
      updateData.unreadCustomer = (conversation.unreadCustomer || 0) + 1;
    }

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    res.json({
      success: true,
      data: { message },
    });
  } catch (error: any) {
    console.error("❌ Send message error:", error);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

router.get(
  "/seller/:conversationId/messages",
  sellerAuthMiddleware,
  async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const storeId = req.query.storeId as string;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        sellerId: req.seller._id,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      if (storeId && conversation.storeId.toString() !== storeId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - This conversation belongs to another store",
        });
      }

      const messages = await Message.find({ conversationId }).sort({
        createdAt: 1,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        unreadSeller: 0,
      });

      res.json({ success: true, data: { messages } });
    } catch (error: any) {
      console.error("❌ Get seller messages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
        error: error.message,
      });
    }
  },
);

router.post(
  "/seller/:conversationId/messages",
  sellerAuthMiddleware,
  async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const storeId = req.query.storeId as string;

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message content is required",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        sellerId: req.seller._id,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      if (storeId && conversation.storeId.toString() !== storeId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - This conversation belongs to another store",
        });
      }

      const message = new Message({
        conversationId,
        senderId: req.seller._id.toString(),
        senderType: "seller",
        content: content.trim(),
        isRead: false,
      });
      await message.save();

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
        $inc: { unreadCustomer: 1 },
      });

      res.json({
        success: true,
        data: { message },
      });
    } catch (error: any) {
      console.error("❌ Send seller message error:", error);
      console.error("❌ Stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to send message",
        error: error.message,
      });
    }
  },
);

export default router;
