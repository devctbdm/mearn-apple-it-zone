// backend/src/controllers/orderController.js

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import PromoCode from '../models/PromoCode.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, note, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      totalAmount += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: price,
        image: product.images[0] || '',
      });
    }

    // Re-validate coupon server-side and apply discount
    let couponDiscount = 0;
    let appliedPromo = null;
    if (couponCode) {
      const promo = await PromoCode.findOne({ code: couponCode.toUpperCase() });
      if (promo) {
        const result = promo.computeDiscount(totalAmount);
        if (result.valid) {
          couponDiscount = result.discount;
          appliedPromo = promo;
        }
      }
    }
    totalAmount = Math.max(0, totalAmount - couponDiscount);

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      coupon: appliedPromo
        ? { code: appliedPromo.code, discount: couponDiscount }
        : undefined,
      payment: {
        method: paymentMethod || 'sslcommerz',
        status: 'pending',
      },
      orderStatus: 'processing',
      note: note || '',
    });

    await order.save();

    if (appliedPromo) {
      appliedPromo.usageCount += 1;
      await appliedPromo.save();
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders of logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID (user or admin)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is authorized (owner or admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const grouped = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const stats = {
      total: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    grouped.forEach((g) => {
      if (stats[g._id] !== undefined) stats[g._id] = g.count;
    });
    stats.total =
      stats.processing + stats.shipped + stats.delivered + stats.cancelled;
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.orderStatus = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
