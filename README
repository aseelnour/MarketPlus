# مشروع: منصة سوق إلكتروني متعددة المتاجر

# Multi-Vendor Marketplace

## 1. فكرة المشروع (Project Overview)

منصة تجارة إلكترونية متعددة المتاجر (Multi-Vendor Marketplace) تجمع عدة بائعين في مكان واحد، بحيث يستطيع كل بائع إنشاء متجره الخاص وإدارة منتجاته، بينما يستطيع العملاء تصفح المنتجات والشراء من متاجر مختلفة داخل نفس المنصة.

# 2. أهداف المشروع (Project Goals)

- بناء منصة Marketplace تدعم عدة متاجر وبائعين.
- توفير نظام متكامل لإدارة المتاجر والمنتجات والطلبات.
- بناء لوحات تحكم مختلفة حسب نوع المستخدم.
- تطبيق مفاهيم Full Stack Development و System Design.
- إنشاء مشروع قابل للتوسع يشبه الأنظمة التجارية الحقيقية.

---

# 3. المستخدمون (User Roles)

# Customer (العميل)

## الصلاحيات:

- إنشاء حساب وتسجيل الدخول.
- تصفح المنتجات والمتاجر.
- البحث عن المنتجات.
- إضافة المنتجات إلى السلة.
- إضافة المنتجات إلى المفضلة.
- تنفيذ عمليات الشراء.
- متابعة الطلبات.
- تقييم المنتجات.
- التواصل مع البائعين.
- مقارنة المنتجات.
- استقبال توصيات شخصية.

---

# Seller (البائع)

## الصلاحيات:

- إنشاء متجر خاص.
- تعديل معلومات المتجر.
- إضافة المنتجات.
- تعديل وحذف المنتجات.
- إدارة المخزون.
- إدارة الطلبات.
- متابعة الأرباح.
- إنشاء كوبونات خصم.
- التواصل مع العملاء.
- مشاهدة إحصائيات المتجر.

---

# Admin (المدير)

## الصلاحيات:

- إدارة المستخدمين.
- إدارة المتاجر.
- الموافقة على حسابات البائعين.
- إدارة المنتجات.
- إدارة التصنيفات.
- متابعة البلاغات.
- مشاهدة إحصائيات المنصة.
- إدارة محتوى النظام.

---

# 4. الخصائص الأساسية للنظام (Core Features)

# Authentication System

يشمل:

- Register
- Login
- Logout
- Email Verification
- Forgot Password
- Reset Password
- JWT Authentication
- Refresh Token

---

# Marketplace

واجهة السوق الرئيسية تحتوي على:

- جميع المنتجات.
- جميع المتاجر.
- التصنيفات.
- المنتجات المميزة.
- المنتجات الأكثر مبيعًا.
- أحدث المنتجات.
- العروض والخصومات.

---

# Store Management

كل بائع يمتلك متجرًا خاصًا يحتوي على:

- اسم المتجر.
- شعار المتجر.
- صورة الغلاف.
- وصف المتجر.
- معلومات التواصل.
- تقييم المتجر.
- المنتجات الخاصة بالمتجر.
- عدد المتابعين.

---

# Product Management

البائع يستطيع:

- إضافة منتج.
- تعديل منتج.
- حذف منتج.
- رفع عدة صور.
- تحديد السعر.
- تحديد الخصم.
- إدارة الكمية.
- إضافة خيارات المنتج.

مثل:

- اللون.
- الحجم.
- النوع.

---

# Shopping Cart

العميل يستطيع:

- إضافة منتجات للسلة.
- حذف منتجات.
- تعديل الكمية.
- حفظ المنتجات للشراء لاحقًا.

---

# Checkout

يشمل:

- اختيار عنوان الشحن.
- اختيار طريقة الدفع.
- مراجعة الطلب.
- تأكيد عملية الشراء.

---

# Orders Management

## Customer:

- مشاهدة الطلبات.
- تتبع الطلب.
- معرفة حالة الطلب.

## Seller:

- مشاهدة الطلبات.
- قبول أو رفض الطلب.
- تحديث حالة الطلب.

حالات الطلب:

- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled

---

# Reviews System

كل منتج يحتوي على:

- تقييم بالنجوم.
- تعليق.
- صور.
- تقييمات العملاء.

---

# Wishlist

العميل يستطيع:

- إضافة منتجات للمفضلة.
- حذف منتجات.
- مشاهدة قائمة المفضلة.

# 7. Dashboards

# Customer Dashboard

يحتوي على:

- Profile
- Orders
- Wishlist
- Recently Viewed Products
- Notifications
- Saved Addresses

---

# Seller Dashboard

يحتوي على:

- Store Overview
- Products Management
- Orders
- Customers
- Revenue
- Analytics
- Coupons
- Messages
- AI Tools

---

# Admin Dashboard

يحتوي على:

- Users Management
- Sellers Management
- Stores Management
- Products Management
- Categories Management
- Reports
- Analytics

---

# 8. Database Design

# Users

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

---

# Stores

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

---

# Categories

Fields:

- id
- name
- icon
- parentCategoryId

---

# Products

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

---

# ProductImages

Fields:

- id
- productId
- imageUrl

---

# ProductVariants

Fields:

- id
- productId
- color
- size
- quantity
- price

---

# Cart

Fields:

- id
- userId

---

# CartItems

Fields:

- id
- cartId
- productId
- quantity

---

# Wishlist

Fields:

- id
- userId
- productId

---

# Orders

Fields:

- id
- userId
- totalPrice
- paymentStatus
- status
- createdAt

---

# OrderItems

Fields:

- id
- orderId
- productId
- sellerId
- quantity
- price

---

# Reviews

Fields:

- id
- userId
- productId
- rating
- comment
- createdAt

---

# Messages

Fields:

- id
- senderId
- receiverId
- message
- createdAt

---

# Notifications

Fields:

- id
- userId
- title
- body
- type
- isRead

---

# AI Conversations

Fields:

- id
- userId
- prompt
- response
- createdAt

---

# Recently Viewed

Fields:

- id
- userId
- productId

---

# Store Followers

Fields:

- id
- storeId
- userId

---

# Reports

Fields:

- id
- reporterId
- productId
- storeId
- reason
- status

---

# 9. Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- React Query
- React Hook Form
- Zod

---

## Backend

- Node.js
- Express.js
- TypeScript

---

## Database

- PostgreSQL
- Prisma ORM

---

## Storage

- Cloudinary

---

## Realtime

- Socket.IO

---

## Search

- Meilisearch

---

## DevOps

- Docker
- GitHub Actions

---

# 10. Development Phases

# Phase 1 - MVP

- Authentication
- Users
- Stores
- Categories
- Products
- Marketplace
- Product Details

---

# Phase 2

- Cart
- Checkout
- Orders
- Reviews
- Wishlist
- Seller Dashboard

---

# Phase 3

- Chat System
- Notifications
- Coupons
- Analytics

---

# Future Improvements

- Visual Search باستخدام الصور.
- نظام أسئلة وأجوبة للمنتجات.
- متابعة المتاجر.
- إشعارات العروض.
- نظام اقتراحات متقدم باستخدام Machine Learning.

الـ Main Category
تبقى عامة وبموافقة الأدمن،
لكن السيلر ما يحط منتجاته مباشرة تحتها،
بل ينظمها داخل أقسام خاصة فيه
(Seller Categories).
ولما يضيف منتج،
يختار أولًا الـ
Main Category
ثم يختار واحدة من الـ
Seller Categories
التابعة إله ضمن هذا القسم.

---

Main Category (بوافق عليها الأدمن)
هاي اللي أنتو عملتوها بالفعل (add-category).
مثال:
Electronics
Fashion
Home
Sports
هاي بتكون Global، وكل السيّلرز بشوفوها.

---

Seller Category (خاصة بكل Seller)
كل Seller بقدر يعمل Categories خاصة فيه تحت الـ
Main Categories.
مثلاً:
Seller اسمه Ahmad
عمل:
Main Category: Electronics
وبعدين أنشأ Seller Categories:
Phones
Laptops
Accessories
Used Devices

أما Seller ثاني ممكن بنفس الـ Main Category يعمل:
Gaming,Cameras ,Smart Home
يعني كل Seller عنده Structure خاص فيه.

############customer page ################

المهام القادمة لـ Customer App:

1. Store Page (صفحة السوق)
   عرض جميع الأسواق (Sellers)

فلترة حسب التصنيف

عرض معلومات السوق

2. Store Details Page (صفحة سوق معين)
   عرض معلومات السوق

عرض أقسام السوق (Seller Categories)

عرض منتجات كل قسم

متابعة السوق (Follow)

3. Product Details Page (صفحة منتج)
   عرض تفاصيل المنتج (صور، سعر، وصف)

تقييمات العملاء

إضافة إلى السلة

إضافة إلى المفضلة

منتجات مشابهة

4. Search Page (صفحة البحث)
   عرض نتائج البحث

فلترة حسب التصنيف

فلترة حسب السعر

5. Cart Page (صفحة السلة)
   عرض المنتجات في السلة

تحديث الكميات

حذف منتج

إجمالي السعر

زر Checkout

6. Checkout Page (صفحة إتمام الطلب)
   عنوان الشحن

طريقة الدفع

مراجعة الطلب

تأكيد الطلب

7. Login/Register (صفحات تسجيل الدخول)(optional)
   تسجيل دخول العميل

إنشاء حساب جديد

حفظ الجلسة

8. Customer Dashboard (لوحة تحكم العميل)
   الطلبات السابقة

المفضلة (Wishlist)

الملف الشخصي

عناوين الشحن
