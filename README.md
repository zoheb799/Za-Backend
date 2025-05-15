# Za-Backend

Za-Backend is the backend API for the Za-Ecommerce platform, built using **Node.js**, **Express.js**, and **MongoDB**. It supports user authentication (buyers & sellers), profile management, and secure login/logout with JWT and refresh tokens.

---

## 📦 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** + **Mongoose**
- **JWT (Access & Refresh Tokens)**
- **Bcrypt.js** for password hashing
- **Cookies** for secure token storage
- **Custom Middleware** for async handling and error management

---

## 🚀 Features

- 🔐 **Register/Login** with role-based support (`buyer` / `seller`)
- 🧠 **Secure Authentication** using access and refresh tokens
- 👤 **Profile Management** (update and fetch profile)
- 🚪 **Logout** with cookie/token cleanup
- 📦 **Modular Code Structure** (routes, controllers, utils, models)
- ✅ **Middleware-based error handling**
- ⚙️ Ready to deploy (with environment support and production handling)

---


---

## 📌 Environment Variables

Create a `.env` file at the root:

```env

PORT=5421
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=1d
STRIPE_SECRET_KEY = your_key

# 1. Clone the repo
git clone https://github.com/zoheb799/za-backend.git
cd za-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit the .env file accordingly

# 4. Run the server
npm run dev


