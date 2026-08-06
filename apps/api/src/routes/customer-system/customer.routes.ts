import { Router, Request, Response, NextFunction } from "express";
import { customerService } from "../../services/customer/customer.service";
import { authMiddleware } from "../../middlewares/customer-system/auth.middleware.customer";
import { body, validationResult } from "express-validator";

interface AuthRequest extends Request {
  customer?: { _id: string } | any;
}

const router = Router();

// Register
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customer, token } = await customerService.register(req.body);
      res.status(201).json({ customer, token });
    } catch (error) {
      next(error);
    }
  },
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customer, token } = await customerService.login(req.body);
      res.json({ customer, token });
    } catch (error) {
      next(error);
    }
  },
);

// Get profile (Protected)
router.get(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.getCustomerById(req.customer._id);
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

// Update profile (Protected)
router.put(
  "/profile",
  authMiddleware,
  [
    body("firstName").optional().isString(),
    body("lastName").optional().isString(),
    body("phone").optional().isString(),
    body("avatar").optional().isString(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const customer = await customerService.updateProfile(
        req.customer._id,
        req.body,
      );
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

// Wishlist (Protected)
router.post(
  "/wishlist/:productId",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.addToWishlist(
        req.customer._id,
        req.params.productId,
      );
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/wishlist/:productId",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.removeFromWishlist(
        req.customer._id,
        req.params.productId,
      );
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

// Cart (Protected)
router.post(
  "/cart",
  authMiddleware,
  [
    body("productId").isString().withMessage("Product ID is required"),
    body("storeId").isString().withMessage("Store ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("price").isNumeric().withMessage("Price is required"),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, storeId, quantity, price } = req.body;
      const customer = await customerService.addToCart(
        req.customer._id,
        productId,
        storeId,
        quantity,
        price,
      );
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/cart/:productId",
  authMiddleware,
  [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be 0 or more"),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const customer = await customerService.updateCartItem(
        req.customer._id,
        req.params.productId,
        req.body.quantity,
      );
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/cart/:productId",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.removeFromCart(
        req.customer._id,
        req.params.productId,
      );
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/cart",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.clearCart(req.customer._id);
      res.json({ customer });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
