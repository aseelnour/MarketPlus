import { Router, Request, Response } from "express";
import { sellerAuthMiddleware } from "../../middlewares/sellerAuth.middleware";
import { Store } from "../../models/store.model";
import { Seller } from "../../models/Seller.model";
import { Category } from "../../models/Category.model";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../../uploads/stores");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `store-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!") as any, false);
    }
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

router.get("/", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    const sellerObjectId = new mongoose.Types.ObjectId(req.seller._id);

    const stores = await Store.find({
      owner: sellerObjectId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: { stores } });
  } catch (error) {
    console.error("Get seller stores error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stores" });
  }
});

router.post("/", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    const {
      name,
      category,
      description,
      location,
      socialLinks,
      storeCategoryIds,
    } = req.body;

    let slug = req.body?.slug?.trim();
    if (!slug && name) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "name and slug are required",
      });
    }

    if (!storeCategoryIds || storeCategoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one store category is required",
      });
    }

    const validCategories = await Category.find({
      _id: { $in: storeCategoryIds },
      type: "store",
      isActive: true,
      isDeleted: false,
    });

    if (validCategories.length !== storeCategoryIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more store categories are invalid",
      });
    }

    const existingSlug = await Store.findOne({ slug });
    if (existingSlug) {
      return res
        .status(400)
        .json({ success: false, message: "Slug already in use" });
    }

    const store = new Store({
      name,
      slug,
      description: description || "",
      logo: "",
      coverImage: "",
      storeCategoryIds: storeCategoryIds,
      categories: category ? [category] : [],
      owner: req.seller._id,
      location: location || {
        address: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
        coordinates: {},
      },
      socialLinks: socialLinks || {},
      isActive: false,
      isVerified: false,
    });

    await store.save();

    return res.status(201).json({
      success: true,
      message: "Store created successfully. Waiting for admin approval.",
      data: { store },
    });
  } catch (error) {
    console.error("Create store error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create store" });
  }
});

router.get("/:id", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const store = await Store.findOne({
      _id: id,
      owner: req.seller._id,
      isDeleted: { $ne: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or not owned by you",
      });
    }

    res.json({
      success: true,
      data: { store },
    });
  } catch (error) {
    console.error("Get store error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store",
    });
  }
});

router.put("/:id", sellerAuthMiddleware, (req: any, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

      const store = await Store.findOne({ _id: id, owner: req.seller._id });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      const files = req.files as any;
      if (files?.logo) {
        store.logo = `/uploads/stores/${files.logo[0].filename}`;
      }
      if (files?.coverImage) {
        store.coverImage = `/uploads/stores/${files.coverImage[0].filename}`;
      }

      if (updates.name) store.name = updates.name;
      if (updates.slug) store.slug = updates.slug;
      if (updates.description) store.description = updates.description;
      if (updates.category) store.categories = [updates.category];

      if (updates.storeCategoryIds && Array.isArray(updates.storeCategoryIds)) {
        const validCategories = await Category.find({
          _id: { $in: updates.storeCategoryIds },
          type: "store",
          isActive: true,
          isDeleted: false,
        });
        if (validCategories.length === updates.storeCategoryIds.length) {
          store.storeCategoryIds = updates.storeCategoryIds;
        }
      }

      store.isActive = false;
      store.isVerified = false;

      await store.save();

      res.json({
        success: true,
        message: "Store updated. It needs admin re-approval.",
        data: { store },
      });
    } catch (error) {
      console.error("Update store error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update store" });
    }
  });
});

router.delete("/:id", sellerAuthMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const store = await Store.findOneAndUpdate(
      { _id: id, owner: req.seller._id },
      { isDeleted: true, isActive: false },
      { new: true },
    );
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or not owned by you",
      });
    }
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ success: false, message: "Failed to delete store" });
  }
});

router.put("/:id/images", sellerAuthMiddleware, (req: any, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      const store = await Store.findOne({ _id: id, owner: req.seller._id });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found or not owned by you",
        });
      }

      const files = req.files as any;
      if (files?.logo) {
        store.logo = `/uploads/stores/${files.logo[0].filename}`;
      }
      if (files?.coverImage) {
        store.coverImage = `/uploads/stores/${files.coverImage[0].filename}`;
      }

      await store.save();

      res.json({
        success: true,
        message: "Images updated successfully",
        data: { store },
      });
    } catch (error) {
      console.error("Upload images error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload images",
      });
    }
  });
});
export default router;
