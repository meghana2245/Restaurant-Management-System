const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
      min: [1, 'Table number must be at least 1'],
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Table capacity must be at least 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Occupied', 'Reserved'],
        message: '{VALUE} is not a valid table status',
      },
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
