const Order = require('../models/Order');
const Inventory = require('../models/Inventory');





const getDailySales = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          status: 'Completed',
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: '%Y-%m-%d', date: startOfDay } },
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalOrders: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
        },
      },
    ]);

    const salesData = result.length > 0
      ? result[0]
      : {
          date: startOfDay.toISOString().split('T')[0],
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        };

    res.status(200).json({ success: true, data: salesData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};






const getLowStock = async (req, res) => {
  try {
    const lowStockItems = await Inventory.aggregate([
      {
        $match: {
          $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
        },
      },
      {
        $project: {
          itemName: 1,
          stockQuantity: 1,
          unit: 1,
          lowStockThreshold: 1,
          deficit: { $subtract: ['$lowStockThreshold', '$stockQuantity'] },
        },
      },
      {
        $sort: { stockQuantity: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      message:
        lowStockItems.length > 0
          ? `${lowStockItems.length} item(s) are running low on stock`
          : 'All inventory items are sufficiently stocked',
      data: lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};





const getTopSellingItems = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', 1] } }, 
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          _id: 0,
          menuItemId: '$_id',
          name: '$menuItem.name',
          category: '$menuItem.category',
          price: '$menuItem.price',
          totalQuantitySold: 1,
          orderCount: 1,
          totalRevenue: { $round: [{ $multiply: ['$menuItem.price', '$totalQuantitySold'] }, 2] },
        },
      },
    ]);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getDailySales, getLowStock, getTopSellingItems };
