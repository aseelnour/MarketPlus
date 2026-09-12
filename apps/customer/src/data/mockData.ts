// import { Product, StoreItem } from "../types";

// export const categories = [
//   { id: "all", label: "All", labelAr: "الكل", icon: "✦" },
//   {
//     id: "electronics",
//     label: "Electronics",
//     labelAr: "إلكترونيات",
//     icon: "📱",
//   },
//   { id: "fashion", label: "Fashion", labelAr: "أزياء", icon: "👗" },
//   { id: "home", label: "Home", labelAr: "منزل", icon: "🏠" },
//   { id: "beauty", label: "Beauty", labelAr: "جمال", icon: "💄" },
//   { id: "sports", label: "Sports", labelAr: "رياضة", icon: "⚽" },
//   { id: "food", label: "Food", labelAr: "طعام", icon: "🍕" },
// ];

// export const stores: StoreItem[] = [
//   {
//     id: 1,
//     name: "TechZone",
//     nameAr: "تك زون",
//     category: "electronics",
//     rating: 4.8,
//     products: 342,
//     followers: 12400,
//     image:
//       "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=80&h=80&fit=crop&auto=format",
//     cover:
//       "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=160&fit=crop&auto=format",
//     verified: true,
//     followed: false,
//   },
//   {
//     id: 2,
//     name: "StyleHub",
//     nameAr: "ستايل هب",
//     category: "fashion",
//     rating: 4.6,
//     products: 891,
//     followers: 28700,
//     image:
//       "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=80&h=80&fit=crop&auto=format",
//     cover:
//       "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=160&fit=crop&auto=format",
//     verified: true,
//     followed: true,
//   },
//   {
//     id: 3,
//     name: "HomeNest",
//     nameAr: "هوم نيست",
//     category: "home",
//     rating: 4.7,
//     products: 215,
//     followers: 8900,
//     image:
//       "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=80&h=80&fit=crop&auto=format",
//     cover:
//       "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=160&fit=crop&auto=format",
//     verified: false,
//     followed: false,
//   },
//   {
//     id: 4,
//     name: "GlowBeauty",
//     nameAr: "غلو بيوتي",
//     category: "beauty",
//     rating: 4.9,
//     products: 178,
//     followers: 45100,
//     image:
//       "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop&auto=format",
//     cover:
//       "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=160&fit=crop&auto=format",
//     verified: true,
//     followed: false,
//   },
//   {
//     id: 5,
//     name: "SportsPeak",
//     nameAr: "سبورتس بيك",
//     category: "sports",
//     rating: 4.5,
//     products: 423,
//     followers: 19200,
//     image:
//       "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop&auto=format",
//     cover:
//       "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=160&fit=crop&auto=format",
//     verified: true,
//     followed: false,
//   },
// ];

// export const products: Product[] = [
//   {
//     id: 1,
//     name: "AirPods Pro Max",
//     nameAr: "إير بودز برو ماكس",
//     price: 549,
//     originalPrice: 699,
//     image:
//       "https://images.unsplash.com/photo-1625708458528-802ec79b1ed8?w=400&h=400&fit=crop&auto=format",
//     rating: 4.8,
//     reviews: 2341,
//     store: "TechZone",
//     storeId: 1,
//     category: "electronics",
//     badge: "Sale",
//   },
//   {
//     id: 2,
//     name: "Silk Floral Dress",
//     nameAr: "فستان حريري",
//     price: 89,
//     originalPrice: 130,
//     image:
//       "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop&auto=format",
//     rating: 4.6,
//     reviews: 873,
//     store: "StyleHub",
//     storeId: 2,
//     category: "fashion",
//     badge: "Trending",
//   },
//   {
//     id: 3,
//     name: "Smart LED Desk Lamp",
//     nameAr: "مصباح مكتب ذكي",
//     price: 65,
//     image:
//       "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&auto=format",
//     rating: 4.7,
//     reviews: 412,
//     store: "HomeNest",
//     storeId: 3,
//     category: "home",
//   },
//   {
//     id: 4,
//     name: "Vitamin C Serum",
//     nameAr: "سيروم فيتامين سي",
//     price: 42,
//     originalPrice: 58,
//     image:
//       "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format",
//     rating: 4.9,
//     reviews: 1580,
//     store: "GlowBeauty",
//     storeId: 4,
//     category: "beauty",
//     badge: "Hot",
//   },
//   {
//     id: 5,
//     name: "Wireless Gaming Mouse",
//     nameAr: "ماوس جيمنج لاسلكي",
//     price: 79,
//     image:
//       "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&auto=format",
//     rating: 4.5,
//     reviews: 924,
//     store: "TechZone",
//     storeId: 1,
//     category: "electronics",
//   },
//   {
//     id: 6,
//     name: "Yoga Mat Pro",
//     nameAr: "حصيرة يوغا احترافية",
//     price: 55,
//     originalPrice: 75,
//     image:
//       "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop&auto=format",
//     rating: 4.6,
//     reviews: 667,
//     store: "SportsPeak",
//     storeId: 5,
//     category: "sports",
//   },
//   {
//     id: 7,
//     name: "Linen Throw Pillow Set",
//     nameAr: "طقم وسائد كتانية",
//     price: 38,
//     image:
//       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&auto=format",
//     rating: 4.4,
//     reviews: 298,
//     store: "HomeNest",
//     storeId: 3,
//     category: "home",
//   },
//   {
//     id: 8,
//     name: "Running Sneakers",
//     nameAr: "حذاء جري",
//     price: 120,
//     originalPrice: 160,
//     image:
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format",
//     rating: 4.7,
//     reviews: 2109,
//     store: "SportsPeak",
//     storeId: 5,
//     category: "sports",
//     badge: "New",
//   },
// ];

// export const orders = [
//   {
//     id: "#ORD-8821",
//     date: "July 28, 2026",
//     status: "Delivered",
//     total: 614,
//     items: 2,
//     color: "text-emerald-600 bg-emerald-50",
//   },
//   {
//     id: "#ORD-8734",
//     date: "July 14, 2026",
//     status: "Processing",
//     total: 89,
//     items: 1,
//     color: "text-amber-600 bg-amber-50",
//   },
//   {
//     id: "#ORD-8612",
//     date: "June 30, 2026",
//     status: "Delivered",
//     total: 231,
//     items: 3,
//     color: "text-emerald-600 bg-emerald-50",
//   },
//   {
//     id: "#ORD-8500",
//     date: "June 10, 2026",
//     status: "Cancelled",
//     total: 55,
//     items: 1,
//     color: "text-red-500 bg-red-50",
//   },
// ];
