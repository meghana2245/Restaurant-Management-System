const express = require('express');
const router = express.Router();
const { getAllReservations, createReservation, cancelReservation, getUserReservations } = require('../controllers/reservationController');


router.get('/', getAllReservations);


router.get('/user/:name', getUserReservations);


router.post('/', createReservation);


router.delete('/:id', cancelReservation);

module.exports = router;
