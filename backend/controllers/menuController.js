const MenuItem = require('../models/MenuItem');


const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate('ingredients.inventoryItem', 'itemName unit stockQuantity');
    res.status(200).json({ success: true, count: menuItems.length, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('ingredients.inventoryItem', 'itemName unit stockQuantity');
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Menu item created successfully', data: menuItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Menu item with name '${req.body.name}' already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('ingredients.inventoryItem', 'itemName unit stockQuantity');

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, message: 'Menu item updated successfully', data: menuItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Menu item with name '${req.body.name}' already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem };
