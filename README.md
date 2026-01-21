# Amazon – Ecommerce Full-Stack Web System 🛒

> Amazon-like E-commerce Web Application (Full-Stack Web App)
> Developed by **Ahmed Medhat**

<div align="center">
  <img src="https://i0.wp.com/magzoid.com/wp-content/uploads/2025/05/amazon-rebrand-2025_dezeen_2364_col_1-1.webp?fit=2364%2C1330&ssl=1" alt="Amazon Logo" width="500" />
</div>

---
## 📋 Project Overview
**Amazon** is a full-stack e-commerce web application built to deliver a seamless online shopping experience for customers and powerful management tools for sellers and administrators. The platform allows users to browse products, manage carts and orders, track shipments in real time, and complete secure payments.

For sellers and administrators, the system provides comprehensive tools to manage products, inventory, orders, users, and analytics. Built with scalability and reliability in mind, the platform ensures high performance, accurate inventory tracking, and a smooth, secure shopping experience for all users.

**Developed by:** Ahmed Medhat
**Project Type:** Full‑Stack Web Application
**License:** Proprietary – All rights reserved

---
## 🚀 Live Demo
> Coming soon...

---
# 📱 Web System Screenshots
## 🔐 Authentication Screens
### Login Page
![Login Page](./public/auth/auth%20(sign%20up%20page).png)
*User authentication interface*

### Registration Page  
![Registration](./public/auth/auth%20(create%20account).png)
*New user registration form*

## 👥 User Screens
### User Dashboard
![User Homepage](./public/user/user%20(homepage).png)
*Main user hompage*

![User Product Page](./public/user/user%20(product%20page).png)
*User product page*

![User Product Detail](./public/user/user%20(product%20detail%20page).png)
*User product detail*

![User Dashboard](./public/user/user%20(user%20dashboard).png)
*Main user interface with navigation*

## ⚙️ Admin Screens
### Admin Dashboard
![Admin Dashboard](./public/admin/admin%20(admin%20dashboard).png)
*Administrator control panel*

![Admin Dashboard #2](./public/admin/admin%20(admin%20dashboard)%20(2).png)
*Administrator control panel*

![User Management](./public/admin/admin%20(user-management).png)
*Admin user management interface*

![Product Management](./public/admin/admin%20(product%20management%20page).png)
*Admin product management interface*

---
## 🏗️ Project Structure
### Backend (ExpressJS – MVC Architecture)
```
server/
├── app/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   └── productController.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── middlewares/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── validationMiddleware.js
│   └── validations/
│       ├── authValidation.js
│       ├── adminValidation.js
│       ├── cartValidation.js
│       └── productValidation.js
├── config/
│   └── database.js
├── node_modules/
├── routes/
│   ├── api/
│   │   ├── authRoutes.routes.js
│   │   ├── userRoutes.routes.js
│   │   ├── cartRoutes.routes.js
│   │   └── productRoutes.routes.js
│   └── web/
│       └── license.js
├── utils/
│   └── jwt.js
├── tests/
│   └── test-connection.js
├── public/
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

### Frontend (ReactJS + Bootstrap/Tailwind)
```
client/
├── node_modules/
├── public/
│   └── amazon.jpg
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RequireAuth.jsx
│   │   │   │   ├── RequireGuest.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── guard/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   └── DashboardRedirect.jsx
│   │   │   ├── store/
│   │   │   │   ├── ProductPage.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── CategorizedProducts.jsx
│   │   │   │   ├── CategoriesGrid.jsx
│   │   │   │   └── CartSidebar.jsx
│   │   │   ├── admin/
│   │   │   │   ├── ProductManagement.jsx
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── AddToCartButton.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── UnauthorizedPage.jsx
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── routes/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── ProtectedRoutes.jsx
│   │   │   └── GuestRoute.jsx
│   │   ├── context/
│   │   │   └── ProductContext.jsx
│   │   ├── hooks/
│   │   │   └── authHook.js
│   │   ├── ui/
│   │   │   ├── Loader.jsx
│   │   │   ├── NetworkError.jsx
│   │   │   ├── RouterError.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── utils/
│   │   │   └── dataLoader.js
│   │   └── styles/
│   │       ├── LoginPage.module.css
│   │       ├── RegisterPage.module.css
│   │       ├── UserDashboard.module.css
│   │       ├── AdminDashboard.module.css
│   │       ├── Auth.module.css
│   │       ├── AddToCartButton.module.css
│   │       ├── DashboardRedirect.module.css
│   │       ├── ProductPage.module.css
│   │       ├── CategorizedProducts.module.css
│   │       ├── CategoriesGrid.module.css
│   │       ├── CartSidebar.module.css
│   │       ├── ProductManagement.module.css
│   │       ├── UserManagement.module.css
│   │       ├── HomePage.module.css
│   │       ├── NotFound.module.css
│   │       ├── UnauthorizedPage.module.css
│   │       ├── MainLayout.module.css
│   │       ├── SerachBar.module.css
│   │       └── Loader.module.css
│   ├── assets/
│   │   ├── Amazon_icon.svg
│   │   ├── amazon-header.png
│   │   └── amazon-logo.jpg
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── vite.config.js
```

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
## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React Frontend)                  │
│                    • Bootstrap/Tailwind UI                  │
│                    • Responsive Design                      │
│                    • JWT Token Management                   │
└─────────────┬─────────────────────────────────────┬─────────┘
              │                                     │
              ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer              │
│                    • Rate Limiting                          │
│                    • CORS Management                        │
│                    • Request Routing                        │
└─────────────┬─────────────────────────────────────┬─────────┘
              │                                     │
              ▼                                     ▼
┌────────────────────────────────────────────────────────────┐
│                    Express.js Server                       │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │   Routes    │  │ Middlewares │  │     Controllers   │   │
│  │ • API       │  │ • Auth      │  │ • Business Logic  │   │
│  │ • Web       │  │ • Validation│  │ • Data Processing │   │
│  │ • Protected │  │ • Admin     │  │ • Error Handling  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬────────┘   │
│         │                │                     │           │
│         └────────────────┼─────────────────────┘           │
│                          ▼                                 │
│                 ┌──────────────┐                           │
│                 │    Models    │                           │
│                 │ • Data Layer │                           │
│                 │ • ORM Queries│                           │
│                 │ • Validation │                           │
│                 └──────┬───────┘                           │
└────────────────────────┼───────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    MySQL Database                          │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │    Users    │  │   Products  │  │      Orders       │   │
│  │ • Auth Data │  │ • Inventory │  │ • Transactions    │   │
│  │ • Profiles  │  │ • Pricing   │  │ • Payments        │   │
│  │ • Roles     │  │ • Categories│  │ • Shipping        │   │
│  └─────────────┘  └─────────────┘  └───────────────────┘   │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │     Cart    │  │ Order Items │  │     Reviews       │   │
│  │ • Session   │  │ • Line Items│  │ • Ratings         │   │
│  │ • Temporary │  │ • Pricing   │  │ • Comments        │   │
│  │ • Merge     │  │ • Taxes     │  │ • Moderation      │   │
│  └─────────────┘  └─────────────┘  └───────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow & Data Flow
### 1. Authentication Flow
```js
Client → POST /api/auth/login → Auth Controller → User Model → DB
      ← JWT Token + User Data ← Success Response ← Hash Compare ←
```

### 2. Product Browsing Flow
```js
Client → GET /api/products → Product Controller → Product Model → DB
      ← Paginated Products ← Filter/Sort Processing ← Query Optimization ←
```

### 3. Cart Management Flow
```js
Client → POST /api/cart → Cart Controller → Cart Model → DB
      ← Cart Item Added ← Stock Validation ← Price Verification ←
```

### 4. Order Processing Flow
```js
Client → POST /api/orders → Order Controller → Transaction → Multiple Models → DB
      ← Order Confirmation ← Payment Processing ← Stock Deduction ← Cart Clear ←
```

---
## 🛠️ Technologies Used

### 🖥️ Backend Technologies
| Technology                                                                                                                | Purpose                           | Version |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)                | JavaScript Runtime Environment    | 18.x+   |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)            | Web Application Framework         | 4.x     |
| ![Rate Limit](https://img.shields.io/badge/Express_Rate_Limit-FF0000?style=for-the-badge&logoColor=white)                 | API Rate Limiting Middleware      | 7.x     |
| ![Helmet](https://img.shields.io/badge/Helmet-000000?style=for-the-badge&logo=helmet&logoColor=white)                     | Security Headers Middleware       | 7.x     |
| ![CORS](https://img.shields.io/badge/CORS-000000?style=for-the-badge&logo=cors&logoColor=white)                           | Cross-Origin Resource Sharing     | 2.x     |
| ![Bcrypt](https://img.shields.io/badge/Bcrypt-000000?style=for-the-badge&logo=bcrypt&logoColor=white)                     | Password Hashing Library          | 5.x     |
| ![Cookie Parser](https://img.shields.io/badge/Cookie_Parser-FF6B6B?style=for-the-badge&logoColor=white)                   | Cookie Parsing Middleware         | 1.x     |
| ![Morgan](https://img.shields.io/badge/Morgan-000000?style=for-the-badge&logo=morgan&logoColor=white)                     | HTTP Request Logger               | 1.x     |
| ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)                  | Development Server Auto-Restart   | 3.x     |
| ![Dotenv](https://img.shields.io/badge/Dotenv-000000?style=for-the-badge&logo=dotenv&logoColor=white)                     | Environment Variables Loader      | 16.x    |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)                    | JSON Web Tokens Authentication    | 9.x     |
| ![MySQL2](https://img.shields.io/badge/MySQL2-005C84?style=for-the-badge&logo=mysql&logoColor=white)                      | MySQL Database Driver             | 3.x     |


### 🎨 Frontend Technologies
| Technology                                                                                                                | Purpose                           | Version |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)                       | Frontend JavaScript Library       | 18.x    |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)            | CSS Framework for Styling         | 5.x     |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)                        | HTTP Client for API Calls         | 1.x     |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)   | Client-side Routing               | 6.x     |
| ![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white)   | Icon Library                      | 6.x     |


### 🗄️ Database & Tools
| Technology                                                                                                                | Purpose                           | Version |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------- |
| ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)                        | Relational Database               | 8.x     |
| ![MySQL Workbench](https://img.shields.io/badge/MySQL_Workbench-4479A1?style=for-the-badge&logo=mysql&logoColor=white)    | Database Design & Management      | 8.x     |

---
## ✨ Core Features
### 🔐 Authentication & Authorization
* JWT‑based authentication
* Role‑based access control (User / Admin)
* Secure password hashing with **bcrypt**
* Protected routes and APIs
* Secure session handling

---
### 📅 Product Management
**User Capabilities**
- Order products for the available products
- View personal cart

**Admin Capabilities**
- View and manage all products
- Override or cancel products
- Control time slot availability
- Monitor products activity
---

### ⚡ Real‑Time Capabilities
* Live time slot availability
* Instant product confirmation
* Real‑time status updates
* Interactive product table preview

### 🎨 User Interface
* Fully responsive design (Bootstrap / Tailwind)
* Interactive booking calendar
* Clear status indicators
* Professional modals and alerts
* Accessible and intuitive navigation

---
## 🚀 Getting Started
### Prerequisites
* **Node.js** v18 or higher
* **MySQL** v8 or higher
* **npm**

---
## 📖 API Documentation
### Authentication
* `POST /api/auth/register` – Register new user
* `POST /api/auth/login` – User login
* `POST /api/auth/logout` – User logout
* `GET /api/auth/verify` – Verify JWT token

### Products
* `GET /api/products` – Get products (Admin: all / User: own)
* `GET /api/products/:product_id` – Get products via id/search
* `POST /api/products` – Create products (Admins only)
* `PUT /api/products/:product_id` – Update products (Admins only)
* `DELETE /api/products/:id` – Delete products (Admins only) 

### 🛒 Cart Management
* `GET /api/cart` – Get user's cart
* `GET /api/cart/summary` – Get cart summary (total items, quantity, price)
* `POST /api/cart` – Add product to cart
* `POST /api/cart` – Add product to cart
* `PUT /api/cart/:cart_id` – Update cart item quantity
* `DELETE /api/cart/:cart_id` – Remove item from cart
* `DELETE /api/cart` – Clear entire cart

### 🛒 Order Management
* `GET /api/orders/user` – Get user's orders
* `GET /api/orders/:order_id` – Get user specific order
* `GET /api/orders/` – Display all orders for management (Admins Only)
* `GET /api/orders/stats` – Display all orders stst (Admins Only)
* `POST /api/orders/` – Create new order
* `PUT /api/orders/:order_id/status` – Update order status (Admins Only)
* `PUT /api/orders/:order_id/payment` – Update order status (payments) (Admins Only)
* `PUT /api/orders/:order_id/cancel` – Update order status (cancellation)
* `DELETE /api/orders/:order_id` – Delete Order (Admins Only)

---
## 🔒 Security Features
* Helmet.js security headers
* CORS configuration
* CSRF protection
* SQL injection prevention 
* Input validation and Sanitization with `express-validator`
* Rate limiting with `express-rate-limit`
* Secure JWT refresh mechanism 

---
## 📱 Dashboards
### User Dashboard
* Booking history
* Upcoming reservations
* Profile management
* Booking status tracking

### Admin Dashboard
* Booking overview
* User management
* Product management
* Order management
* System analytics
* Platform configuration

---
## 🤝 Contributing
This is a **proprietary project**. External contributions are **not accepted**.

---
## 📄 License
**PROPRIETARY LICENSE**
© 2026 Ahmed Medhat. All Rights Reserved.
This project is a personal, non-commercial work created solely for the purpose of demonstrating full-stack web development skills.

The name**Amazon** is used strictly as a conceptual reference for learning and portfolio demonstration purposes only. This project is not affiliated with, endorsed by, sponsored by, or connected to Amazon.com, Inc. or any of its subsidiaries.

*All trademarks, service marks, and brand names referenced remain the property of their respective owners*.

This software and associated documentation are proprietary and confidential. No part of this project may be reproduced, distributed, or transmitted in any form without prior written permission from the author.
---
## 💭 A Personal Note
*This system design represents my **first major step into backend engineering** following industry best practices. **While I acknowledge this isn't a 100% complete, fully integrated business service, this project marks a significant milestone in my career development.***

*As I transition from learning concepts to implementing real-world systems, I'm embracing the complexity and responsibility that comes with backend engineering. This **Amazon-like e-commerce platform** isn't just another CRUD application it's my foundation for understanding how robust, scalable systems are built.*
---
## 👥 Author
* **Ahmed Medhat** – Full Stack Web Developer