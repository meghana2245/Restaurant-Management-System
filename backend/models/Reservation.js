const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table reference is required'],
    },
    reservationTime: {
      type: Date,
      required: [true, 'Reservation date and time are required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
