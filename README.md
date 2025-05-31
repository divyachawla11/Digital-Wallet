# 💸 Digital Wallet System with Fraud Detection

A backend RESTful API for a secure digital wallet system with features like authentication, transaction management, and fraud detection.

## 🚀 Features

- User Registration and Login (JWT Auth)
- Wallet operations: Deposit, Withdraw, Transfer
- Transaction Validation and Limits
- Fraud Detection (rate limiting + daily anomaly scan)
- Admin APIs for User and Transaction Reports
- Soft Delete Support
- Email Alerts (optional/coming soon)

## 📁 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Node-cron (for scheduled jobs)

## 🛠️ How to Run Locally

```bash
git clone https://github.com/divyachawla11/Digital-Wallet.git
cd digital-wallet-system
npm install
npm run dev
