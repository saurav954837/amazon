# Amazon – Ecommerce Full-Stack Web System 🛒

> Amazon-like E-commerce Web Application (Database)
> Developed by **Ahmed Medhat**

<div align="center">
  <img src="https://i0.wp.com/magzoid.com/wp-content/uploads/2025/05/amazon-rebrand-2025_dezeen_2364_col_1-1.webp?fit=2364%2C1330&ssl=1" alt="Amazon Logo" width="500" />
</div>

--- 
## 📋 Database Overview
The **Amazon** Database is a *MySQL-based* relational database designed to support a full-featured e-commerce platform. This schema implements core e-commerce functionality including user management, product catalog, shopping cart, order processing, and reviews system. The database follows normalization principles while maintaining simplicity for development and portfolio demonstration.

**Database Name:** amazon_db
**Engine:** InnoDB
**Charset:** utf8mb4
**Collation:** utf8mb4_unicode_ci

**Developed by:** Ahmed Medhat
**Project Type:** E-commerce Database 
**License:** Proprietary – All rights reserved

---
## 🏗️ Project Structure
### Database (MySql)
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      users      │       │     products    │       │       cart      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ user_id (PK)    │───────│ product_id (PK) │◄──────│ cart_id (PK)    │
│ username        │       │ product_name    │       │ user_id (FK)    │
│ first_name      │       │ product_category│       │ product_id (FK) │
│ last_name       │       │ product_desc    │       │ quantity        │
│ email           │       │ product_image   │       │ created_at      │
│ password_hash   │       │ product_quantity│       │ updated_at      │
│ role            │       │ product_price   │       └─────────────────┘
│ created_at      │       │ product_status  │               ▲
│ updated_at      │       │ created_at      │               │
│ last_login      │       │ updated_at      │               │
└─────────────────┘       └─────────────────┘               │
       │                          ▲                         │
       │                          │                         │
       ▼                          │                         │
┌─────────────────┐               │              ┌─────────────────┐
│     orders      │               │              │   order_items   │
├─────────────────┤               │              ├─────────────────┤
│ order_id (PK)   │◄──────────────┼──────────────│ order_item_id   │
│ user_id (FK)    │               │              │ order_id (FK)   │
│ total_amount    │               │              │ product_id (FK) │
│ status          │               │              │ quantity        │
│ shipping_address│               │              │ price_at_purchase│
│ payment_method  │               │              │ created_at      │
│ payment_status  │               │              └─────────────────┘
│ created_at      │               │                       ▲
│ updated_at      │               │                       │
└─────────────────┘               │                       │
                                  │                       │
                           ┌─────────────────┐            │
                           │     reviews     │            │
                           ├─────────────────┤            │
                           │ review_id (PK)  │            │
                           │ user_id (FK)    │────────────┘
                           │ product_id (FK) │────────────┐
                           │ rating          │            │
                           │ comment         │            │
                           │ created_at      │            │
                           │ updated_at      │            │
                           └─────────────────┘            │
                                  ▲                       │
                                  │                       │
                                  └───────────────────────┘
```

---
## 🗂️ Table Specifications
### 👥 users – User Management
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(55) NOT NULL,
    first_name VARCHAR(55) NOT NULL,
    last_name VARCHAR(55) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);
```
**Indexes:** idx_email, idx_username.
**Purpose:** Stores all user accounts with authentication details and role-based permissions.

### 📦 products – Product Catalog
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(55) NOT NULL,
    product_description TEXT,
    product_image VARCHAR(255),
    product_quantity INT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Indexes:** idx_category, idx_status.
**Purpose:** Main product inventory with pricing, availability, and categorization.

### 🛒 cart – Shopping Cart
```sql
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Foreign Keys:** user_id → users.user_id, product_id → products.product_id.
**Unique Constraint:** unique_cart_item (prevents duplicate items in cart).
**Purpose:** Temporary storage for user's shopping cart items before checkout.

### 📋 orders – Order Management
```
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Foreign Key:** user_id → users.user_id.
**Indexes:** idx_user, idx_status.
**Purpose:** Stores order headers with shipping, payment, and status information.

### 📦 order_items – Order Line Items
```
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Foreign Keys:** order_id → orders.order_id, product_id → products.product_id.
**Index:** idx_order.
**Purpose:** Stores individual products within each order with snapshot pricing.

### ⭐ reviews – Product Reviews & Ratings
```
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Foreign Keys:** user_id → users.user_id, product_id → products.product_id.
**Unique Constraint:** unique_review (one review per user per product).
**Indexes:** idx_product, idx_user.
**Purpose:** User-generated reviews and ratings for products.

---
## 🤝 Contributing
This is a **proprietary project**. External contributions are **not accepted**.

---
## 📄 License
**PROPRIETARY LICENSE**
© 2025 Ahmed Medhat. All Rights Reserved.
This project is a personal, non-commercial work created solely for the purpose of demonstrating full-stack web development skills.

The name **Amazon** is used strictly as a conceptual reference for learning and portfolio demonstration purposes only. This project is not affiliated with, endorsed by, sponsored by, or connected to Amazon.com, Inc. or any of its subsidiaries.

*All trademarks, service marks, and brand names referenced remain the property of their respective owners*.

This software and associated documentation are proprietary and confidential. No part of this project may be reproduced, distributed, or transmitted in any form without prior written permission from the author.
---
## 👥 Author
* **Ahmed Medhat** – Full Stack Web Developer