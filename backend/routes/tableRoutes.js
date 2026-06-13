const express = require('express');
const router = express.Router();
const {
  getAllTables,
  getTableById,
  createTable,
  reserveTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');



router.route('/').get(getAllTables).post(createTable);


router.put('/:id/reserve', reserveTable);




router.route('/:id').get(getTableById).put(updateTable).delete(deleteTable);

module.exports = router;
