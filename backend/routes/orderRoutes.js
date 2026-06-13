const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  completeOrder,
  serveOrder,
} = require('../controllers/orderController');



router.route('/').get(getAllOrders).post(createOrder);


router.put('/:id/complete', completeOrder);


router.put('/:id/serve', serveOrder);


router.route('/:id').get(getOrderById);

module.exports = router;
