const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Inventory item reference is required'],
    },
    quantityRequired: {
      type: Number,
      required: [true, 'Quantity required per dish is required'],
      min: [0, 'Quantity required cannot be negative'],
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Menu item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    ingredients: {
      type: [ingredientSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
