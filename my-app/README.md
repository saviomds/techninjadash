# Affiliate Marketing & Product Ordering System

This is a full-stack web application built with **Next.js**, **React.js**, **Node.js**, and **PostgreSQL**, designed to manage an affiliate marketing system with integrated product ordering, admin dashboards, and AI-based fraud detection.

---

## 🚀 Project Overview

This project combines multiple systems into one platform:

* Affiliate marketing tracking system
* Product ordering system (combos)
* Admin dashboard for managing products and content
* User dashboard after order completion
* AI-based fraud detection for transaction safety

---

## 🧠 Key Features

### 🛒 Product Ordering System

* Users can browse and order **combos**
* Data is dynamically loaded from `combos.json`
* Fully dynamic CRUD system for products

### 🧑‍💼 Admin Dashboard

* Add, update, and delete products (combos)
* Manage catalog through Express API routes
* Data stored in JSON or database depending on configuration
* No templating engines used (no EJS)

### 📊 User Dashboard

* Users are redirected after completing an order
* Clean and modern UI dashboard experience
* Displays order summary and status

### 🔐 Backend System

* Built with **Node.js + Express**
* API routes for managing products and orders
* Handles dynamic requests:

  * `POST /admin/products`
  * `PUT /admin/products/:idx`
  * `DELETE /admin/products/:idx`

### 🤖 AI Fraud Detection

* Detects suspicious or abnormal order behavior
* Helps reduce fake or abusive transactions

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* React.js
* HTML, CSS, JavaScript (Vanilla where needed)

### Backend

* Node.js
* Express.js
* File-based storage (`.json`) + PostgreSQL integration

### Database

* PostgreSQL (primary database)
* JSON files used for lightweight product storage during development

---

## 📁 Project Structure

```
/app
  ├── page.js
  ├── dashboard/
  ├── admin/

/server
  ├── routes/
  ├── controllers/

/db
  ├── db.json
  ├── combos.json

/public
  ├── assets
```

---

## ⚙️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 3. Start backend server (if separate)

```bash
node server/index.js
```

### 4. Open in browser

```
http://localhost:3000
```

---

## 🧩 API Endpoints

### Admin Products

* `POST /admin/products`
* `PUT /admin/products/:idx`
* `DELETE /admin/products/:idx`

---

## 📦 Data Sources

* `combos.json` → stores product combos
* `db.json` → main system configuration

---

## 🎯 Goals

* Build a scalable affiliate + ordering system
* Provide smooth admin control over products
* Ensure secure and fraud-resistant ordering flow
* Deliver clean user experience with dashboard redirection

---

## 🌐 Deployment

Recommended deployment:

* Frontend: Vercel
* Backend: Render / Railway / VPS
* Database: Supabase / PostgreSQL hosted instance

---

## 📌 Notes

* No EJS or server-side templating is used
* Fully API-driven architecture
* Focus on modular and scalable system design

---

## 👨‍💻 Author

**Name:** Dominique Savio
**Role:** Full-stack Developer (Next.js, Node.js, React.js, PostgreSQL)
**Focus:** Building scalable web applications, affiliate systems, dashboards, and automation tools

**Links:**

* GitHub: (add your GitHub here)
* Portfolio: (add your portfolio here)
* Email: (add your email here)

---

Built with a focus on scalability, automation, and real-world business use cases (affiliate + ordering + admin control).
