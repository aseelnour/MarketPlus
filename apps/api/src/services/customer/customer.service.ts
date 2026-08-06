import { Customer } from "../../models/customer-system/customer.model";
import {
  ICustomer,
  IRegisterRequest,
  ILoginRequest,
  IUpdateProfileRequest,
  ICartItem,
} from "../../interfaces/customer-system/customer.interface";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";

export class CustomerService {
  // Register new customer
  async register(
    data: IRegisterRequest,
  ): Promise<{ customer: ICustomer; token: string }> {
    const existingCustomer = await Customer.findOne({ email: data.email });
    if (existingCustomer) {
      throw new Error("Customer already exists with this email");
    }

    const customer = new Customer(data);
    await customer.save();

    const token = this.generateToken(customer._id.toString());

    return { customer, token };
  }

  // Login customer
  async login(
    data: ILoginRequest,
  ): Promise<{ customer: ICustomer; token: string }> {
    const customer = await Customer.findOne({ email: data.email });
    if (!customer) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await customer.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    const token = this.generateToken(customer._id.toString());

    return { customer, token };
  }

  // Get customer by ID
  async getCustomerById(id: string): Promise<ICustomer | null> {
    return Customer.findById(id)
      .populate("wishlist")
      .populate("cart.productId")
      .exec();
  }

  // Update customer profile
  async updateProfile(
    id: string,
    data: IUpdateProfileRequest,
  ): Promise<ICustomer | null> {
    return Customer.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );
  }

  // Add to wishlist
  async addToWishlist(
    customerId: string,
    productId: string,
  ): Promise<ICustomer | null> {
    return Customer.findByIdAndUpdate(
      customerId,
      { $addToSet: { wishlist: new Types.ObjectId(productId) } },
      { new: true },
    );
  }

  // Remove from wishlist
  async removeFromWishlist(
    customerId: string,
    productId: string,
  ): Promise<ICustomer | null> {
    return Customer.findByIdAndUpdate(
      customerId,
      { $pull: { wishlist: new Types.ObjectId(productId) } },
      { new: true },
    );
  }

  // Add to cart
  async addToCart(
    customerId: string,
    productId: string,
    storeId: string,
    quantity: number,
    price: number,
  ): Promise<ICustomer | null> {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    // Check if product already exists in cart
    const existingItemIndex = customer.cart.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // Update existing item
      (customer.cart[existingItemIndex] as ICartItem).quantity += quantity;
    } else {
      // Add new item
      customer.cart.push({
        productId: new Types.ObjectId(productId),
        storeId: new Types.ObjectId(storeId),
        quantity,
        price,
        addedAt: new Date(),
      });
    }

    await customer.save();
    return customer;
  }

  // Update cart item
  async updateCartItem(
    customerId: string,
    productId: string,
    quantity: number,
  ): Promise<ICustomer | null> {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    const itemIndex = customer.cart.findIndex(
      (item: ICartItem) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new Error("Product not found in cart");
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      customer.cart = customer.cart.filter(
        (item: ICartItem) => item.productId.toString() !== productId,
      );
    } else {
      // Update quantity
      (customer.cart[itemIndex] as ICartItem).quantity = quantity;
    }

    await customer.save();
    return customer;
  }

  // Remove from cart
  async removeFromCart(
    customerId: string,
    productId: string,
  ): Promise<ICustomer | null> {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    customer.cart = customer.cart.filter(
      (item: ICartItem) => item.productId.toString() !== productId,
    );

    await customer.save();
    return customer;
  }

  // Clear cart
  async clearCart(customerId: string): Promise<ICustomer | null> {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    customer.cart = [];
    await customer.save();
    return customer;
  }

  // Get cart items
  async getCart(customerId: string): Promise<ICartItem[] | null> {
    const customer = await Customer.findById(customerId)
      .populate("cart.productId")
      .populate("cart.storeId")
      .exec();

    if (!customer) return null;
    return customer.cart;
  }

  // Generate JWT token
  private generateToken(customerId: string): string {
    return jwt.sign(
      { id: customerId, role: "customer" },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" },
    );
  }
}

export const customerService = new CustomerService();
