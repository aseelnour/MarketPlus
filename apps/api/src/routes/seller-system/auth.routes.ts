
import { Router, Request, Response } from "express";
import { validationResult } from "express-validator";
import { SellerAuthService } from "../../services/seller/auth.service";
import {
  validateRegistration,
  validateLogin,
} from "../../validation/auth.validation";

const router = Router();

router.post(
  "/register",
  validateRegistration,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await SellerAuthService.register(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  },
);

router.post("/login", validateLogin, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const result = await SellerAuthService.login(req.body);
  return res.status(result.success ? 200 : 401).json(result);
});

router.post("/logout", (req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
