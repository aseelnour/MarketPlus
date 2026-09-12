
import { Router } from "express";
import { Follow } from "../../models/Follow.model";
import { Store } from "../../models/store.model";
import { Customer } from "../../models/Customer.model";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    if (!guestId) {
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });
    }

    let follow = await Follow.findOne({ guestId });

    if (!follow) {
      follow = new Follow({ guestId, storeIds: [] });
      await follow.save();
    }

    res.json({
      success: true,
      data: {
        follow: {
          storeIds: follow.storeIds || [],
        },
      },
    });
  } catch (error) {
    console.error("❌ Get follows error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch follows",
    });
  }
});

router.post("/:storeId", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    const { storeId } = req.params;

    if (!guestId) {
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    let customer = await Customer.findOne({ guestId });

    if (!customer) {
      customer = new Customer({
        guestId: guestId,
        fullName: "Guest",
        phone: "N/A",
        email: "",
        follow: { storeIds: [] },
      });
      await customer.save();
    }

    let follow = await Follow.findOne({ guestId });

    if (!follow) {
      follow = new Follow({ guestId, storeIds: [] });
      await follow.save();
    }

    const isFollowing = follow.storeIds.some((id) => id.toString() === storeId);

    if (isFollowing) {
      
      follow.storeIds = follow.storeIds.filter(
        (id) => id.toString() !== storeId,
      );

      store.followers = store.followers.filter(
        (id) => id.toString() !== customer._id.toString(),
      );
    } else {
      
      follow.storeIds.push(store._id);

      store.followers.push(customer._id);
    }

    await follow.save();
    await store.save();

    res.json({
      success: true,
      message: isFollowing ? "Unfollowed" : "Followed",
      data: {
        follow: {
          storeIds: follow.storeIds,
        },
        followersCount: store.followers.length,
        following: !isFollowing,
      },
    });
  } catch (error: any) {
    console.error("❌ Follow error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle follow",
    });
  }
});

router.delete("/:storeId", async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"] as string;
    const { storeId } = req.params;

    if (!guestId) {
      return res
        .status(400)
        .json({ success: false, message: "Guest ID required" });
    }

    const customer = await Customer.findOne({ guestId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const follow = await Follow.findOne({ guestId });
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "Follow record not found",
      });
    }

    follow.storeIds = follow.storeIds.filter((id) => id.toString() !== storeId);
    await follow.save();

    const store = await Store.findById(storeId);
    if (store) {
      store.followers = store.followers.filter(
        (id) => id.toString() !== customer._id.toString(),
      );
      await store.save();
    }

    res.json({
      success: true,
      message: "Unfollowed successfully",
      data: {
        follow: {
          storeIds: follow.storeIds,
        },
        followersCount: store?.followers?.length || 0,
        following: false,
      },
    });
  } catch (error: any) {
    console.error("❌ Unfollow error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to unfollow",
    });
  }
});

export default router;
