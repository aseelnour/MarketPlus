import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AdminAuthService } from "../../services/admin/auth.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
const router = Router();

// Validation middleware
const validateRegistration = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Register Admin
router.post(
  "/register",
  validateRegistration,
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

// Login Admin
router.post("/login", validateLogin, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const result = await AdminAuthService.login(req.body);
  return res.status(result.success ? 200 : 401).json(result);
});

// Get Admin Profile (Protected)
router.get("/profile", authMiddleware, async (req: any, res: Response) => {
  const adminId = req.admin.id || req.admin._id;
  const result = await AdminAuthService.getProfile(adminId);
  return res.status(result.success ? 200 : 404).json(result);
});

// Logout (client side will remove token)
router.post("/logout", (req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
