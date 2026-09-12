
import { Router, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AdminAuthService } from "../../services/admin/auth.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  validateAdminRegistration,
  validateAdminLogin,
} from "../../validation/auth.validation";

const router = Router();

router.post(
  "/register",
  validateAdminRegistration,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const result = await AdminAuthService.register(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  },
);

router.post(
  "/login",
  validateAdminLogin,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const result = await AdminAuthService.login(req.body);
    return res.status(result.success ? 200 : 401).json(result);
  },
);

router.get("/profile", authMiddleware, async (req: any, res: Response) => {
  const adminId = req.admin.id || req.admin._id;
  const result = await AdminAuthService.getProfile(adminId);
  return res.status(result.success ? 200 : 404).json(result);
});

router.post("/logout", (req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
