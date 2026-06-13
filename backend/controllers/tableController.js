const Table = require('../models/Table');


const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.status(200).json({ success: true, count: tables.length, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, message: 'Table created successfully', data: table });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Table number ${req.body.tableNumber} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const reserveTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    if (table.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableNumber} is currently '${table.status}' and cannot be reserved`,
      });
    }

    table.status = 'Reserved';
    await table.save();

    res.status(200).json({ success: true, message: `Table ${table.tableNumber} has been reserved`, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, message: 'Table updated successfully', data: table });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getAllTables, getTableById, createTable, reserveTable, updateTable, deleteTable };
