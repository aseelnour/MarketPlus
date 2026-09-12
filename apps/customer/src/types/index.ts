export interface Product {
  _id: string;
  id?: string; 
  title: string;
  name?: string; 
  nameAr?: string;
  price: number;
  originalPrice?: number;
  image?: string; 
  images?: string[];
  rating: number;
  reviews?: number;
  storeId?:
    | {
        _id: string;
        name: string;
        logo?: string;
      }
    | string;
  store?: string; 
  category?: string;
  badge?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  nameAr: string;
  categories?: string[];
  category?: string;
  rating: number;
  products: number;
  followers: number;
  image: string;
  cover: string;
  verified: boolean;
  followed: boolean;
}

export interface CartItem {
  productId: Product;
  quantity: number;
  price: number;
}

export type View = "home" | "stores" | "cart" | "wishlist" | "profile";
