export interface ActivityItem {
  id: string;
  type: "new_order" | "new_seller" | "product_added" | "new_customer";
  message: string;
  time: string;
  isDeleted: boolean;
}
