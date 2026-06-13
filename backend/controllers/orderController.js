const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Inventory = require('../models/Inventory');


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('tableId', 'tableNumber capacity status')
      .populate('items.menuItemId', 'name price category')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('tableId', 'tableNumber capacity status')
      .populate('items.menuItemId', 'name price category');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};











const createOrder = async (req, res) => {
  const { tableId, items } = req.body;

  try {
    
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    if (table.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableNumber} is already occupied. Please choose another table.`,
      });
    }

    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } }).populate('ingredients.inventoryItem');

    if (menuItems.length !== items.length) {
      return res.status(404).json({ success: false, message: 'One or more menu items not found' });
    }

    
    const menuItemMap = {};
    menuItems.forEach((mi) => { menuItemMap[mi._id.toString()] = mi; });

    let totalAmount = 0;
    items.forEach((orderItem) => {
      const menuItem = menuItemMap[orderItem.menuItemId.toString()];
      totalAmount += menuItem.price * orderItem.quantity;
    });

    
    
    const inventoryDeductions = {}; 

    for (const orderItem of items) {
      const menuItem = menuItemMap[orderItem.menuItemId.toString()];
      for (const ingredient of menuItem.ingredients) {
        const invId = ingredient.inventoryItem._id.toString();
        const deduction = ingredient.quantityRequired * orderItem.quantity;
        inventoryDeductions[invId] = (inventoryDeductions[invId] || 0) + deduction;
      }
    }

    
    const inventoryIds = Object.keys(inventoryDeductions);
    const inventoryItems = await Inventory.find({ _id: { $in: inventoryIds } });
    const inventoryMap = {};
    inventoryItems.forEach((inv) => { inventoryMap[inv._id.toString()] = inv; });

    const stockErrors = [];
    for (const [invId, deduction] of Object.entries(inventoryDeductions)) {
      const inv = inventoryMap[invId];
      if (!inv) {
        stockErrors.push(`Inventory item (ID: ${invId}) not found`);
      } else if (inv.stockQuantity < deduction) {
        stockErrors.push(
          `Insufficient stock for '${inv.itemName}': available ${inv.stockQuantity} ${inv.unit}, required ${deduction} ${inv.unit}`
        );
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ success: false, message: 'Out of stock', errors: stockErrors });
    }

    
    const bulkOps = inventoryItems.map((inv) => ({
      updateOne: {
        filter: { _id: inv._id },
        update: { $inc: { stockQuantity: -inventoryDeductions[inv._id.toString()] } },
      },
    }));
    await Inventory.bulkWrite(bulkOps);

    
    await Table.findByIdAndUpdate(tableId, { status: 'Occupied' });

    
    const order = await Order.create({ tableId, items, totalAmount, status: 'Pending' });
    const populatedOrder = await order.populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name price category' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Table marked as Occupied and inventory updated.',
      data: populatedOrder,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};





const completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Order is already completed' });
    }

    
    order.status = 'Completed';
    await order.save();

    
    await Table.findByIdAndUpdate(order.tableId, { status: 'Available' });

    const populatedOrder = await order.populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name price category' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Order completed. Table is now Available.',
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};





const serveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Order is already completed' });
    }

    order.status = 'Served';
    await order.save();

    const populatedOrder = await order.populate([
      { path: 'tableId', select: 'tableNumber capacity status' },
      { path: 'items.menuItemId', select: 'name price category' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Order status updated to Served.',
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, completeOrder, serveOrder };
