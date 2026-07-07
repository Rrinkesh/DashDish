# 🍔 Food Delivery Web App

A full-stack **Food Delivery Application** built using **React, Node.js, Express, and Stripe**.
This platform allows users to browse food items, place orders, and make secure payments, while admins can manage items and orders.

---

## 🚀 Features

### 👤 User Side

* 🔐 User authentication (Sign up / Login required)
* 🍽️ Browse food menu
* 🛒 Add / remove items from cart
* 📦 Place orders
* 🏠 Enter delivery address
* 💳 Secure online payment using Stripe
* 📊 View order details

---

### 🛠️ Admin Panel

* ➕ Add new food items
* ❌ Delete food items
* 📋 View all items
* 📦 Manage orders:

  * Order placed
  * Food processing
  * Out for delivery
  * Delivered

---

## 🛠️ Tech Stack

* **Frontend:** React, CSS
* **Backend:** Node.js, Express
* **Database:** (Add yours here – MongoDB / MySQL)
* **Payment:** Stripe API
* **Authentication:** (JWT )

---

## 📂 Project Structure

```
food-delivery/
│── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│
│── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│
│── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/food-delivery.git
cd food-delivery
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run server
```
---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 4️⃣ Environment Variables

Create a `.env` file in backend:

```
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret
JWT_SECRET=your_secret
```

Frontend `.env`:

```
VITE_API_URL=http://localhost:5000
```

---

## 💳 Payment Integration

This app uses **Stripe** for secure online payments.

---

## 🔐 Authentication Flow

* User must **sign up / login**
* Only authenticated users can:

  * Add to cart
  * Place orders
  * Make payments

---

## 📦 Order Workflow

1. User selects food items 🍕
2. Adds items to cart 🛒
3. Proceeds to checkout
4. Enters delivery address 🏠
5. Completes payment 💳
6. Admin processes order:

   * Processing
   * Out for delivery
   * Delivered 🚚

---

## 📸 Screenshots

#user side...
<img width="1171" height="632" alt="image" src="https://github.com/user-attachments/assets/8de91cda-8bd3-4277-9377-0b59eaa394d6" />
<img width="1212" height="623" alt="image" src="https://github.com/user-attachments/assets/bb79bb69-1629-49eb-9781-4c0ca056266a" />
<img width="1165" height="593" alt="image" src="https://github.com/user-attachments/assets/6d232ed2-e212-42db-a469-1b7d5704ab4d" />
<img width="1208" height="521" alt="image" src="https://github.com/user-attachments/assets/c0e81082-0e71-4f78-8c5c-5611a1da0aa7" />
<img width="1153" height="615" alt="image" src="https://github.com/user-attachments/assets/017e0d01-3b95-4b0c-a686-56f8d130a258" />

#admin side...
<img width="1307" height="417" alt="image" src="https://github.com/user-attachments/assets/27ef0e6f-a57c-4d09-8be1-447e01dbcd46" />
<img width="1237" height="451" alt="image" src="https://github.com/user-attachments/assets/72a90783-8cc0-4707-96d2-f7763c65edd1" />
<img width="1011" height="615" alt="image" src="https://github.com/user-attachments/assets/1e6d119f-90b5-4374-97d7-7401b67c55b6" />







---

## ✨ Future Improvements

* 🔔 Real-time order tracking
* 📱 Mobile responsiveness improvement
* 🌙 Dark mode
* ⭐ Ratings & reviews
* 📍 Live location tracking

---

## 🤝 Contributing

Contributions are welcome! Fork the repo and submit a PR.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Developed by **Rinkesh Bhati**

---
