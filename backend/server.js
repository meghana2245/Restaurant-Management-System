require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const menuRoutes        = require('./routes/menuRoutes');
const tableRoutes       = require('./routes/tableRoutes');
const inventoryRoutes   = require('./routes/inventoryRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const reportRoutes      = require('./routes/reportRoutes');
const userRoutes        = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');


connectDB();

const app = express();


app.use(cors({
    origin: "https://my-platea-app.vercel.app" 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant Management API is running',
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/menu',         menuRoutes);
app.use('/api/tables',       tableRoutes);
app.use('/api/inventory',    inventoryRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/reservations', reservationRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API Base URL: http://localhost:${PORT}/api`);
});
