import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { SellerAuthService } from "../../services/seller/auth.service";

const router = Router();

const validateRegistration = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("storeName").notEmpty().withMessage("Store name is required"),
  body("categories").isArray().withMessage("Categories must be an array"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

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
