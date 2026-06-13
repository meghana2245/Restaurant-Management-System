const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');



router.route('/').get(getAllInventory).post(createInventoryItem);




router.route('/:id').get(getInventoryById).put(updateInventoryItem).delete(deleteInventoryItem);

module.exports = router;
