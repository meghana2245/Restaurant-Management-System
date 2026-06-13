const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');



router.route('/').get(getAllMenuItems).post(createMenuItem);




router.route('/:id').get(getMenuItemById).put(updateMenuItem).delete(deleteMenuItem);

module.exports = router;
