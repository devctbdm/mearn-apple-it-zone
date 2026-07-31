// backend/src/controllers/paymentController.js

import SSLCommerzPayment from 'sslcommerz-lts';
import Order from '../models/Order.js';

// Helper: update order payment status
const updateOrderPayment = async (tran_id, status, data = {}) => {
  const order = await Order.findOne({ 'payment.tran_id': tran_id });
  if (!order) {
    return null;
  }

  order.payment.status = status;
  if (data.val_id) {
    order.payment.val_id = data.val_id;
  }
  if (data.card_type) {
    order.payment.card_type = data.card_type;
  }
  if (data.amount) {
    order.payment.amount = data.amount;
  }
  if (status === 'paid') {
    order.payment.paidAt = new Date();
    order.orderStatus = 'processing';
  }
  await order.save();
  return order;
};

// @desc    Initiate SSLCommerz payment
// @route   POST /api/payment/initiate
// @access  Private (user must be authenticated)
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, customer } = req.body;

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure order belongs to the authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    // Check if already paid
    if (order.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const store_id = process.env.SSL_STORE_ID;
    const store_passwd = process.env.SSL_STORE_PASSWORD;
    const is_live = process.env.SSL_IS_LIVE === 'true';

    const tran_id = `ORDER_${orderId}_${Date.now()}`;

    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: process.env.SSL_SUCCESS_URL,
      fail_url: process.env.SSL_FAIL_URL,
      cancel_url: process.env.SSL_CANCEL_URL,
      ipn_url: process.env.SSL_IPN_URL,
      shipping_method: 'Courier',
      product_name: 'Apple IT Zone Product',
      product_category: 'Electronics',
      product_profile: 'general',
      cus_name: customer.name || req.user.name,
      cus_email: customer.email || req.user.email,
      cus_add1: customer.address || 'Dhaka',
      cus_add2: customer.address2 || 'Dhaka',
      cus_city: customer.city || 'Dhaka',
      cus_state: customer.state || 'Dhaka',
      cus_postcode: customer.postcode || '1000',
      cus_country: 'Bangladesh',
      cus_phone: customer.phone || req.user.phone || '01700000000',
      cus_fax: customer.phone || '01700000000',
      ship_name: customer.name || req.user.name,
      ship_add1: customer.address || 'Dhaka',
      ship_add2: customer.address2 || 'Dhaka',
      ship_city: customer.city || 'Dhaka',
      ship_state: customer.state || 'Dhaka',
      ship_postcode: customer.postcode || '1000',
      ship_country: 'Bangladesh',
      value_a: orderId, // custom data (order ID)
      value_b: req.user._id.toString(),
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const apiResponse = await sslcz.init(data);

    if (apiResponse.GatewayPageURL) {
      // Save transaction info in order
      order.payment.tran_id = tran_id;
      order.payment.sessionKey = apiResponse.sessionkey;
      order.payment.amount = amount;
      order.payment.status = 'pending';
      await order.save();

      return res.json({
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
        tran_id: tran_id,
      });
    }
    console.error('SSLCommerz init error:', apiResponse);
    return res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: apiResponse,
    });
  } catch (error) {
    console.error('Initiate Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate payment (success callback)
// @route   POST /api/payment/validate
// @access  Public (SSLCommerz redirects here)
export const validatePayment = async (req, res) => {
  try {
    const { val_id, tran_id, status } = req.body;

    if (status === 'VALID') {
      const store_id = process.env.SSL_STORE_ID;
      const store_passwd = process.env.SSL_STORE_PASSWORD;
      const is_live = process.env.SSL_IS_LIVE === 'true';

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const validation = await sslcz.validate({ val_id });

      if (validation.verify_sign && validation.verify_status === 'VALID') {
        // Payment successful
        await updateOrderPayment(tran_id, 'paid', {
          val_id,
          card_type: validation.card_type || '',
          amount: validation.total_amount,
        });

        // Redirect to frontend success page
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?tran_id=${tran_id}&status=success`
        );
      }
    }

    // Payment failed
    await updateOrderPayment(tran_id, 'failed');
    return res.redirect(`${process.env.FRONTEND_URL}/payment-fail?tran_id=${tran_id}`);
  } catch (error) {
    console.error('Validation Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-fail`);
  }
};

// @desc    IPN (Instant Payment Notification) listener
// @route   POST /api/payment/ipn
// @access  Public (SSLCommerz IPN)
export const ipnListener = async (req, res) => {
  try {
    const { tran_id, status, val_id, amount, card_type } = req.body;

    console.log('IPN Received:', { tran_id, status, amount, card_type });

    if (status === 'VALID') {
      const store_id = process.env.SSL_STORE_ID;
      const store_passwd = process.env.SSL_STORE_PASSWORD;
      const is_live = process.env.SSL_IS_LIVE === 'true';

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const validation = await sslcz.validate({ val_id });

      if (validation.verify_sign && validation.verify_status === 'VALID') {
        // Confirm payment
        await updateOrderPayment(tran_id, 'paid', {
          val_id,
          card_type,
          amount,
        });
        return res.status(200).send('IPN processed successfully');
      }
    }

    // If invalid, mark as failed
    await updateOrderPayment(tran_id, 'failed');
    res.status(400).send('IPN validation failed');
  } catch (error) {
    console.error('IPN Error:', error);
    res.status(500).send('IPN processing failed');
  }
};

// @desc    Cancel payment
// @route   GET /api/payment/cancel
// @access  Public (SSLCommerz redirects here)
export const cancelPayment = async (req, res) => {
  try {
    const { tran_id } = req.query;
    if (tran_id) {
      await updateOrderPayment(tran_id, 'cancelled');
    }
    res.redirect(`${process.env.FRONTEND_URL}/payment-cancel?tran_id=${tran_id}`);
  } catch (error) {
    console.error('Cancel Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-cancel`);
  }
};
