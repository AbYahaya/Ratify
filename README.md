# Student Association Payment System

This is a full-stack web application for managing student payments and withdrawals for a university association (NACOS). It allows students to make payments, check account status, and enables admins to view transactions, filter records, and export statements.

---

## 🚀 Features

### 🎓 Student Side

* **Payment Interface:** Students can fill in their details and make payments via Paystack.
* **Purpose Selection:** Option to specify if payment is for NACOS levy or donation.
* **Receipt Generation:** Automatic PDF receipt generated after successful payment.
* **Account Status:** Students can check their account balance and transaction history using their name and reference.

### 🛠️ Admin Side

* **Secure Admin Login:** JWT-based authentication with persistent login via HTTP-only cookies.
* **Dashboard Overview:** View summary of total payments, total withdrawals, and net balance.
* **Transaction Table:** Filter by name, reference, or date range.
* **Withdrawal Records:** View and manage manual withdrawal entries.
* **PDF Export:** Export filtered transactions as a PDF statement with opening and closing balances.

---

## 🧱 Tech Stack

* **Frontend:** React (Vite), TailwindCSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose)
* **Payments:** Paystack API
* **PDF Generation:** PDFKit
* **Auth:** JWT (admin only)
* **Testing:** Postman, Ngrok

---

## 📁 Project Structure (Key Files)

### Backend (`/server`)

* `server.js` – Main Express app
* `models/transactionModel.js` – Mongoose schema for transactions
* `models/withdrawalModel.js` – Mongoose schema for withdrawals
* `controllers/paymentController.js` – Handles Paystack payments
* `controllers/adminController.js` – Admin login, logout, and protected data
* `controllers/pdfController.js` – Exports transaction statement to PDF
* `controllers/receiptGenerator.js` – Formats A6-size payment receipts
* `middleware/auth.js` – JWT auth middleware for admin routes

### Frontend (`/client`)

* `pages/Home.jsx` – Payment form and receipt handling
* `pages/Status.jsx` – Account status checker
* `pages/AdminLogin.jsx` – Admin login form
* `pages/AdminDashboard.jsx` – Dashboard with filtering, data table, export
* `services/api.js` – API calls to backend

---


