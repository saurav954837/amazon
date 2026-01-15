# Amazon – Ecommerce Full-Stack Web System 🛒

> Amazon-like E-commerce Web Application
> Developed by **Ahmed Medhat**

<div align="center">
  <img src="https://i0.wp.com/magzoid.com/wp-content/uploads/2025/05/amazon-rebrand-2025_dezeen_2364_col_1-1.webp?fit=2364%2C1330&ssl=1" alt="Amazon Logo" width="250" />
</div>

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
## 🏗️ Project Structure
### Backend (ExpressJS – MVC Architecture)
```
server/
│   ├── config/
│   │   ├── db_config.js
│   │   └── settings.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── authRoutes.route.js
│   │   └── productRoutes.route.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── validationMiddleware.js
│   ├── utils/
│   │   └── jwt.js
│   ├── validations/
│   │   ├── authValidation.js
│   │   └── productValidation.js
│   └── server.js
├── .env
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

### Frontend (ReactJS + Bootstrap/Tailwind)
```
client/
│   ├── node_modules/
│   ├── public/
│   │   └── amazon.jpg
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
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
## 🛠️ Technologies Used
| Technology                                                                                                                | Purpose             | Version |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)              | Runtime Environment | 18.x+   |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)          | Backend Framework   | 4.x     |
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)                     | Frontend Library    | 18.x    |
| ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge\&logo=mysql\&logoColor=white)                      | Database            | 8.x     |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)                  | Authentication      | 9.x     |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge\&logo=bootstrap\&logoColor=white)          | CSS Framework       | 5.x     |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge\&logo=axios\&logoColor=white)                      | HTTP Client         | 1.x     |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge\&logo=react-router\&logoColor=white) | Routing             | 6.x     |
| ![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge\&logo=font-awesome\&logoColor=white) | Icons               | 6.x     |

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

---
## 🔒 Security Features
* Helmet.js security headers
* CORS configuration
* CSRF protection
* SQL injection prevention
* Input validation with `express-validator`
* Rate limiting
* Secure JWT refresh mechanism

---
## 📱 Dashboards
### User Dashboard
* Booking history
* Upcoming reservations
* Cancellation & rescheduling
* Profile management
* Booking status tracking

### Admin Dashboard
* Booking overview
* User management
* Time slot control
* System analytics
* Platform configuration

---
## 🤝 Contributing
This is a **proprietary project**. External contributions are **not accepted**.

---
## 📄 License
**PROPRIETARY LICENSE**
© 2025 Ahmed Medhat. All Rights Reserved.
This project is a personal, non-commercial work created solely for the purpose of demonstrating full-stack web development skills.

The name**Amazon** is used strictly as a conceptual reference for learning and portfolio demonstration purposes only. This project is not affiliated with, endorsed by, sponsored by, or connected to Amazon.com, Inc. or any of its subsidiaries.

*All trademarks, service marks, and brand names referenced remain the property of their respective owners*.

This software and associated documentation are proprietary and confidential. No part of this project may be reproduced, distributed, or transmitted in any form without prior written permission from the author.
---
## 👥 Author
* **Ahmed Medhat** – Full Stack Web Developer