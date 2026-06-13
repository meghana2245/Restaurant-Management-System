const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Inventory item name is required'],
      unique: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'units',
      enum: {
        values: ['kg', 'grams', 'liters', 'ml', 'units', 'pieces', 'dozen'],
        message: '{VALUE} is not a valid unit',
      },
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
