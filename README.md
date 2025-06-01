# 💸 Digital Wallet System with Fraud Detection

A backend RESTful API for a secure digital wallet system with features like authentication, transaction management, and rule-based fraud detection.

## 🚀 Features

- ✅ User Registration and Login (JWT-based Authentication)
- ✅ Wallet Operations: Deposit, Withdraw, Transfer
- ✅ Transaction Validation (overdraft, negative values, etc.)
- ✅ Basic Fraud Detection:
  - Multiple transactions in short time
  - Large withdrawal amount
- ✅ Admin APIs:
  - Flagged transaction viewer
  - Total balances and top users
- ✅ Soft Delete for Users and Transactions
- ✅ Daily Fraud Scan with `node-cron`
- 🟡 Email Alerts for Suspicious Activity (Mocked / Optional)

## 🛠️ Tech Stack

- **Node.js + Express** – Backend framework
- **MongoDB + Mongoose** – NoSQL database
- **JWT** – Token-based authentication
- **Bcrypt** – Secure password hashing
- **Node-cron** – Scheduling daily fraud scans

## 📦 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/divyachawla11/Digital-Wallet.git
# Navigate to the project folder
cd Digital-Wallet
# Install dependencies
npm install
# Set up .env file 
# Start the server (nodemon)
npm run dev

**🧪 API Documentation (Postman)**
You can test all endpoints using our Postman Collection.

📁 File: Digital Wallet API.postman_collection.json

**📊 Admin APIs**
Endpoint	Method	Description
/admin/flagged	GET	View all flagged transactions
/admin/stats/summary	GET	View total balances across users
/admin/stats/top	GET	View top 5 users by balance

**🧹 Bonus Features**
✅ Daily fraud scan (runs every midnight)
✅ Soft deletion (mark users/transactions as deleted)
🟡 Email alerts (console-logged for now)
