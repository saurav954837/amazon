# Amazon – Backend (Ecommerce Web System API)

> Amazon-like E-commerce Web Application (Server-Side Web App)
> Developed by **Ahmed Medhat**

<div align="center">
  <img src="https://i0.wp.com/magzoid.com/wp-content/uploads/2025/05/amazon-rebrand-2025_dezeen_2364_col_1-1.webp?fit=2364%2C1330&ssl=1" alt="Amazon Logo" width="500" />
</div>

---
## 📋 Project Overview
**Amazon** is a full-stack e-commerce web application built to deliver a seamless online shopping experience for customers and powerful management tools for sellers and administrators. The platform allows users to browse products, manage carts and orders, track shipments in real time, and complete secure payments.

For sellers and administrators, the system provides comprehensive tools to manage products, inventory, orders, users, and analytics. Built with scalability and reliability in mind, the platform ensures high performance, accurate inventory tracking, and a smooth, secure shopping experience for all users.

**Developed by:** Ahmed Medhat 
**Project Type:** Backend RESTful API  
**License:** Proprietary – All rights reserved

---
## 🏗️ Server Architecture (MVC)
```
server/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── validations/
├── config/
│   └── database.js
├── routes/
│   ├── api/   
│   │   └── v1/
│   └── web/
│       └── license.js
├── utils/
│   └── jwt.js
├── tests/        
├── public/
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

---
## 🛠️ Technologies Used
| Technology | Purpose | Version |
|-----------|--------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | Runtime Environment | 18.x+ |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | Backend Framework | 4.x |
| ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white) | Relational Database | 8.x |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) | Authentication | 9.x |
| ![bcrypt](https://img.shields.io/badge/bcrypt-003A8F?style=for-the-badge&logo=security&logoColor=white) | Password Hashing | Latest |
| ![Helmet](https://img.shields.io/badge/Helmet.js-000000?style=for-the-badge&logo=helmet&logoColor=white) | Security Headers | Latest |
| ![Express Validator](https://img.shields.io/badge/Express--Validator-4B32C3?style=for-the-badge&logo=checkmarx&logoColor=white) | Input Validation | Latest |

---
## ✨ Core Backend Features
### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (User / Admin)
- Secure password hashing using **bcrypt**
- Protected routes via middleware
- Token verification and refresh handling

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
## 🚀 Getting Started
### Prerequisites
- **Node.js** v18+
- **MySQL** v8+
- **npm**

---
## 🤝 Contributing
This is a **proprietary project**. External contributions are **not accepted**.

---
## 📄 License
**PROPRIETARY LICENSE**
© 2026 Ahmed Medhat. All Rights Reserved.
This project is a personal, non-commercial work created solely for the purpose of demonstrating full-stack web development skills.

The name **Amazon** is used strictly as a conceptual reference for learning and portfolio demonstration purposes only. *This project is not affiliated with, endorsed by, sponsored by, or connected to Amazon.com, Inc. or any of its subsidiaries*.

*All trademarks, service marks, and brand names referenced remain the property of their respective owners*.

This software and associated documentation are proprietary and confidential. *No part of this project may be reproduced, distributed, or transmitted in any form without prior written permission from the author*.

---
## 👥 Author
* **Ahmed Medhat** – Full Stack Web Developer