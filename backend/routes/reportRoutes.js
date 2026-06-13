const express = require('express');
const router = express.Router();
const { getDailySales, getLowStock, getTopSellingItems } = require('../controllers/reportController');


router.get('/daily-sales', getDailySales);


router.get('/low-stock', getLowStock);


router.get('/top-selling', getTopSellingItems);

module.exports = router;
