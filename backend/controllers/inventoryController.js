const Inventory = require('../models/Inventory');


const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ itemName: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, message: 'Inventory item created successfully', data: item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Inventory item '${req.body.itemName}' already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, message: 'Inventory item updated successfully', data: item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Inventory item '${req.body.itemName}' already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    res.status(200).json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getAllInventory, getInventoryById, createInventoryItem, updateInventoryItem, deleteInventoryItem };
