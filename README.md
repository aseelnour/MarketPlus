# Project: Multi-Vendor Marketplace Platform

## 1. Project Overview

A multi-vendor e-commerce platform that brings multiple sellers together in one place. Each seller can create and manage their own store, while customers can browse products and purchase items from different stores within the same platform.
The Figma Design for the customer : https://www.figma.com/make/E5Le9q3IRUrcUFeqrKi5yZ/Customer-Dashboard-UI-UX-Design?code-node-id=0-9&fullscreen=1 

## 2. Project Goals

- Build a marketplace platform that supports multiple stores and sellers.
- Provide a complete system for managing stores, products, and orders.
- Build different dashboards based on user roles.
- Apply Full Stack Development and System Design concepts.
- Create a scalable project similar to real-world commercial platforms.

---

## 3. User Roles

### Customer

**Permissions and Features:**

- Create an account and log in.
- Browse products and stores.
- Search for products.
- Add products to the shopping cart.
- Add products to the wishlist.
- Complete purchases.
- Track orders.
- Review and rate products.
- Communicate with sellers.
- Compare products.
- Receive personalized recommendations.

### Seller

**Permissions and Features:**

- Create a personal store.
- Update store information.
- Add products.
- Edit and delete products.
- Manage inventory.
- Manage orders.
- Track earnings.
- Create discount coupons.
- Communicate with customers.
- View store analytics and statistics.

### Admin

**Permissions and Features:**

- Manage users.
- Manage stores.
- Approve seller accounts.
- Manage products.
- Manage categories.
- Monitor reports.
- View platform-wide analytics and statistics.
- Manage system content.

---

## 4. Core Features

### 4.1 Authentication System

Includes:

- Register
- Login
- Logout
- Email Verification
- Forgot Password
- Reset Password
- JWT Authentication
- Refresh Token

### 4.2 Marketplace

The main marketplace page includes:

- All products.
- All stores.
- Categories.
- Featured products.
- Best-selling products.
- Latest products.
- Deals and discounts.

### 4.3 Store Management

Each seller owns a personal store containing:

- Store name.
- Store logo.
- Cover image.
- Store description.
- Contact information.
- Store rating.
- Store products.
- Number of followers.

### 4.4 Product Management

Sellers can:

- Add products.
- Edit products.
- Delete products.
- Upload multiple product images.
- Set product prices.
- Set discount prices.
- Manage product quantities.
- Add product variants.

Product variants include:

- Color.
- Size.
- Type.

### 4.5 Shopping Cart

Customers can:

- Add products to the cart.
- Remove products from the cart.
- Update product quantities.
- Save products for later purchases.

### 4.6 Checkout

Includes:

- Select a shipping address.
- Choose a payment method.
- Review the order.
- Confirm the purchase.

### 4.7 Orders Management

**Customer:**

- View orders.
- Track orders.
- Check order status.

**Seller:**

- View received orders.
- Accept or reject orders.
- Update order status.

**Order Statuses:**

- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled

### 4.8 Reviews System

Each product supports:

- Star ratings.
- Written comments.
- Review images.
- Customer feedback.

### 4.9 Wishlist

Customers can:

- Add products to their wishlist.
- Remove products from their wishlist.
- View their saved products.

---

## 7. Dashboards

### Customer Dashboard

Includes:

- Profile
- Orders
- Wishlist
- Recently Viewed Products
- Notifications
- Saved Addresses

### Seller Dashboard

Includes:

- Store Overview
- Products Management
- Orders
- Customers
- Revenue
- Analytics
- Coupons
- Messages
- AI Tools

### Admin Dashboard

Includes:

- Users Management
- Sellers Management
- Stores Management
- Products Management
- Categories Management
- Reports
- Analytics

---

## 8. Database Design

### Users

Fields:

- id
- firstName
- lastName
- email
- password
- phone
- avatar
- role
- status
- createdAt

### Stores

Fields:

- id
- ownerId
- name
- logo
- coverImage
- description
- phone
- email
- rating
- followersCount

### Categories

Fields:

- id
- name
- icon
- parentCategoryId

### Products

Fields:

- id
- storeId
- categoryId
- title
- description
- price
- discountPrice
- quantity
- brand
- rating
- AI_Summary
- createdAt

### ProductImages

Fields:

- id
- productId
- imageUrl

### ProductVariants

Fields:

- id
- productId
- color
- size
- quantity
- price

### Cart

Fields:

- id
- userId

### CartItems

Fields:

- id
- cartId
- productId
- quantity

### Wishlist

Fields:

- id
- userId
- productId

### Orders

Fields:

- id
- userId
- totalPrice
- paymentStatus
- status
- createdAt

### OrderItems

Fields:

- id
- orderId
- productId
- sellerId
- quantity
- price

### Reviews

Fields:

- id
- userId
- productId
- rating
- comment
- createdAt

### Messages

Fields:

- id
- senderId
- receiverId
- message
- createdAt

### Notifications

Fields:

- id
- userId
- title
- body
- type
- isRead

### AI Conversations

Fields:

- id
- userId
- prompt
- response
- createdAt

### Recently Viewed

Fields:

- id
- userId
- productId

### Store Followers

Fields:

- id
- storeId
- userId

### Reports

Fields:

- id
- reporterId
- productId
- storeId
- reason
- status

---

## 9. Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- React Query
- React Hook Form
- Zod

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Storage

- Cloudinary

### Realtime Communication

- Socket.IO

### Search

- Meilisearch

### DevOps

- Docker
- GitHub Actions

---

## 10. Development Phases

### Phase 1 – MVP

- Authentication
- Users
- Stores
- Categories
- Products
- Marketplace
- Product Details

### Phase 2

- Cart
- Checkout
- Orders
- Reviews
- Wishlist
- Seller Dashboard

### Phase 3

- Chat System
- Notifications
- Coupons
- Analytics

### Future Improvements

- Visual Search using product images.
- Product Questions and Answers system.
- Store Following.
- Deal and discount notifications.
- Advanced recommendation system using Machine Learning.

---

# 11. Category Management System

The category system follows a two-level structure: **Main Categories** and **Seller Categories**.

The Main Categories are global categories managed and approved by the Admin. Sellers cannot add their products directly under these categories. Instead, each seller organizes their products into their own Seller Categories.

When adding a product, the seller must first select a Main Category and then select one of their own Seller Categories that belongs to the selected Main Category.

### 11.1 Main Categories (Admin-Managed)

These are the global categories already implemented through the `add-category` functionality.

Examples:

- Electronics
- Fashion
- Home
- Sports

**Rules:**

- Main Categories are global and shared across the platform.
- All sellers can view and use them.
- Only the Admin can create, manage, and approve Main Categories.

### 11.2 Seller Categories (Seller-Specific)

Each seller can create their own categories under the available Main Categories.

For example:

**Seller: Ahmad**

Main Category: Electronics

Seller Categories:

- Phones
- Laptops
- Accessories
- Used Devices

Another seller can create different categories under the same Main Category.

**Seller: Another Seller**

Main Category: Electronics

Seller Categories:

- Gaming
- Cameras
- Smart Home

**Important Rules:**

- Each seller manages their own Seller Categories.
- Seller Categories are private to the seller who created them.
- Different sellers can have different category structures under the same Main Category.
- Seller Categories must always be associated with a Main Category.
- When adding a product, the seller must select a Main Category first, followed by one of their own Seller Categories under that Main Category.

---

# 12. Customer App – Upcoming Tasks

The following features need to be implemented in the Customer Application.

### 12.1 Store Page (Marketplace Page)

- Display all available stores (sellers).
- Filter stores by category.
- Display store information.

### 12.2 Store Details Page

- Display store information.
- Display the store's Seller Categories.
- Display products belonging to each category.
- Allow customers to follow the store.

### 12.3 Product Details Page

- Display complete product details (images, price, and description).
- Display customer reviews.
- Add products to the shopping cart.
- Add products to the wishlist.
- Display similar products.

### 12.4 Search Page

- Display search results.
- Filter products by category.
- Filter products by price.

### 12.5 Cart Page

- Display products in the shopping cart.
- Update product quantities.
- Remove products from the cart.
- Calculate the total price.
- Provide a Checkout button.

### 12.6 Checkout Page

- Select a shipping address.
- Select a payment method.
- Review the order.
- Confirm the purchase.

### 12.7 Login / Register Pages (Optional)

- Allow customers to log in.
- Allow new customers to create an account.
- Maintain user sessions.

### 12.8 Customer Dashboard

- View previous orders.
- Manage the wishlist.
- Manage the customer profile.
- Manage shipping addresses.
