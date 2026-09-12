import { Cart } from "../../models/Cart.model";
import { Product } from "../../models/Product.model";

export class CartService {
  
  async getCart(guestId: string) {
    let cart = await Cart.findOne({ guestId }).populate({
      path: "items.productId",
      select: "title price images discountPrice storeId",
      populate: { path: "storeId", select: "name" },
    });
    if (!cart) {
      cart = new Cart({ guestId, items: [] });
      await cart.save();
    }
    return cart;
  }

  async addToCart(guestId: string, productId: string, quantity: number = 1) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ guestId });
    if (!cart) {
      cart = new Cart({ guestId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.discountPrice || product.price,
      });
    }

    await cart.save();
    return cart.populate({
      path: "items.productId",
      select: "title price images discountPrice storeId",
      populate: { path: "storeId", select: "name" },
    });
  }

  async updateQuantity(guestId: string, productId: string, delta: number) {
    const cart = await Cart.findOne({ guestId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );
    if (!item) throw new Error("Item not found in cart");

    item.quantity = Math.max(1, item.quantity + delta);
    if (item.quantity === 0) {
      cart.items = cart.items.filter(
        (i) => i.productId.toString() !== productId,
      );
    }

    await cart.save();
    return cart.populate({
      path: "items.productId",
      select: "title price images discountPrice storeId",
      populate: { path: "storeId", select: "name" },
    });
  }

  async removeFromCart(guestId: string, productId: string) {
    const cart = await Cart.findOne({ guestId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();
    return cart.populate({
      path: "items.productId",
      select: "title price images discountPrice storeId",
      populate: { path: "storeId", select: "name" },
    });
  }
}

export const cartService = new CartService();
