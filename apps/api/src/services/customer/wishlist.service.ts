import { Wishlist } from "../../models/Wishlist.model";
import { Product } from "../../models/Product.model";

export class WishlistService {
  
  async getWishlist(guestId: string) {
    let wishlist = await Wishlist.findOne({ guestId }).populate("items");
    if (!wishlist) {
      wishlist = new Wishlist({ guestId, items: [] });
      await wishlist.save();
    }
    return wishlist;
  }

  async toggleProduct(guestId: string, productId: string) {
    
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let wishlist = await Wishlist.findOne({ guestId });
    if (!wishlist) {
      wishlist = new Wishlist({ guestId, items: [] });
    }

    const index = wishlist.items.findIndex((id) => id.toString() === productId);

    if (index > -1) {
      wishlist.items.splice(index, 1); 
    } else {
      wishlist.items.push(product._id); 
    }

    await wishlist.save();
    return wishlist.populate("items");
  }
}

export const wishlistService = new WishlistService();
