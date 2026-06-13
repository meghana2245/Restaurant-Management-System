const Reservation = require('../models/Reservation');
const Table = require('../models/Table');


const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('tableId', 'tableNumber capacity status')
      .sort({ reservationTime: 1 });
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const createReservation = async (req, res) => {
  const { customerName, tableId, reservationTime } = req.body;

  try {
    
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (table.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableNumber} is currently '${table.status}' and cannot be reserved.`,
      });
    }

    if (!customerName || !reservationTime) {
      return res.status(400).json({ success: false, message: 'Customer name and reservation time are required' });
    }

    
    const reservation = await Reservation.create({
      customerName,
      tableId,
      reservationTime: new Date(reservationTime),
    });

    
    table.status = 'Reserved';
    await table.save();

    const populatedReservation = await reservation.populate('tableId', 'tableNumber capacity status');

    res.status(201).json({
      success: true,
      message: `Reservation placed successfully for Table ${table.tableNumber}.`,
      data: populatedReservation,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const tableId = reservation.tableId;

    
    await Reservation.findByIdAndDelete(req.params.id);

    
    const table = await Table.findById(tableId);
    if (table && table.status === 'Reserved') {
      table.status = 'Available';
      await table.save();
    }

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully and table is now Available.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getUserReservations = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const reservations = await Reservation.find({ customerName: name })
      .populate('tableId', 'tableNumber capacity status')
      .sort({ reservationTime: 1 });
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getAllReservations, createReservation, cancelReservation, getUserReservations };
