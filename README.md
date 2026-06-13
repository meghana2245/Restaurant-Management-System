# 🍽️ Restaurant Management System

A full-stack, real-time Restaurant Management System built with **React (Vite) + Tailwind CSS** on the frontend, and **Express.js + Mongoose (MongoDB)** on the backend. This application streamlines interconnected restaurant operations: analytics dashboards, interactive floor/table layout plans, point-of-sale (POS) order dispatching, automatic inventory/recipe deduction, and real-time alerts.

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection)

---

### 📦 Setup & Installation

Follow these steps to set up the entire project:

#### 1. Clone & Initialize the Monorepo
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Environment Variables

Create and edit the `.env` configuration files for both environments:

##### 🔹 Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/restaurant_management
```
*(You can also use a MongoDB Atlas URI as configured in your production database).*

##### 🔹 Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 💻 Running the Application

You can run both the frontend and backend development servers concurrently.

#### Start the Backend Server:
```bash
cd backend
npm run dev
```
*The API server will start at:* `http://localhost:5000`

#### Start the Frontend Client:
```bash
cd frontend
npm run dev
```
*The Vite development server will start at:* `http://localhost:5173` (or the port specified in terminal).

---

## 📁 Project Structure

```
Restaurant_management/
├── backend/                  # Node.js + Express.js API
│   ├── config/               # Database connections
│   ├── controllers/          # Business logic & route handlers
│   ├── models/               # Mongoose database models (Order, MenuItem, etc.)
│   ├── routes/               # API route definitions
│   ├── server.js             # Main server entrypoint
│   └── .env                  # Backend environment variables
│
├── frontend/                 # React + Vite Client
│   ├── public/               # Public assets
│   ├── src/                  # React source code
│   │   ├── components/       # UI Components (Dashboard, POS, FloorPlan, etc.)
│   │   ├── services/         # API client services (Axios hooks/handlers)
│   │   ├── App.jsx           # Main App layout & view management
│   │   ├── index.css         # Tailwind & global stylesheet styles
│   │   └── main.jsx          # React entrypoint
│   ├── tailwind.config.js    # Tailwind layout settings
│   └── .env                  # Frontend environment variables
└── README.md                 # Project Documentation (This file)
```

---

## 🎨 Key Features & Views

### 1. 📊 Executive Dashboard
* **Real-time Analytics:** Tracks Today's Revenue, Completed Orders, and Average Order Value.
* **Top Selling Dishes:** Lists popular dishes along with quantities sold and revenues.
* **Supply Chain Alerts:** Dynamic indicators for low-stock inventory warnings.

### 2. 🪑 Interactive Floor Plan (Table Manager)
* **Status Visualization:** Displays table layouts dynamically indicating whether a table is *Available*, *Occupied*, or *Reserved*.
* **Real-time Interaction:** Quick actions to reserve, sit customers, or free up tables.

### 3. 🧾 Point of Sale (POS) & Order Queue
* **Dynamic Ordering:** Add items to tables, customize quantities, and submit orders.
* **Pre-flight Stock Check:** Validates that the kitchen has enough raw ingredients in stock before accepting/submitting the order.
* **Live Order Queue:** Helps the kitchen track *Pending* orders and mark them as *Served* or *Completed*.

### 4. 📦 Inventory & Ingredient Management
* **Stock Tracking:** Records ingredient counts, units (kg, grams, liters, pieces), and low-stock limits.
* **Automatic Deduction:** Subtracts recipe ingredients in real-time from inventory upon order creation.

### 5. 🍕 Menu & Recipe Manager
* **Add & Update Dishes:** Set prices, categories, and ingredients.
* **Recipe Mapping:** Link menu items to specific inventory ingredients and required quantities (e.g., `0.2 kg` Mozzarella).

---

## 📡 API Endpoints

### 🏥 Health Check
* `GET /api/health` — Returns backend server health check.

### 🍕 Menu — `/api/menu`
* `GET /api/menu` — Retrieve all menu items.
* `GET /api/menu/:id` — Retrieve a single menu item.
* `POST /api/menu` — Add a new menu item with ingredient recipes.
* `PUT /api/menu/:id` — Update menu item details.
* `DELETE /api/menu/:id` — Remove a menu item.

### 🪑 Tables — `/api/tables`
* `GET /api/tables` — Retrieve floor plan / table list.
* `POST /api/tables` — Add a new table.
* `PUT /api/tables/:id` — Update capacity/number.
* `PUT /api/tables/:id/reserve` — Change table state.
* `DELETE /api/tables/:id` — Remove a table.

### 📦 Inventory — `/api/inventory`
* `GET /api/inventory` — Retrieve current stock.
* `POST /api/inventory` — Register a new ingredient.
* `PUT /api/inventory/:id` — Restock/modify an ingredient.
* `DELETE /api/inventory/:id` — Remove an ingredient.

### 🧾 Orders — `/api/orders`
* `GET /api/orders` — Fetch order queue history.
* `POST /api/orders` — Create new order (triggers stock validation and auto-deduction).
* `PUT /api/orders/:id/complete` — Mark order completed, recalculate billing, and free the table.

### 📊 Reports — `/api/reports`
* `GET /api/reports/daily-sales` — Returns today's sales aggregation (Revenue, count, average order value).
* `GET /api/reports/low-stock` — Lists all ingredients currently under their warning thresholds.
* `GET /api/reports/top-selling` — Returns top 10 menu items sorted by quantity sold.
