// backend/src/controllers/paymentController.js

import SSLCommerzPayment from "sslcommerz-lts";
import Order from "../models/Order.js";
import PaymentGateway from "../models/PaymentGateway.js";

// @desc    Load SSLCommerz credentials from DB config, falling back to env
const getSSLCommerzConfig = async () => {
  const gateway = await PaymentGateway.findOne({ name: "sslcommerz" });
  const cfg = gateway?.config || {};
  return {
    storeId: cfg.storeId || process.env.SSL_STORE_ID || "testbox",
    storePassword: cfg.storePassword || process.env.SSL_STORE_PASSWORD || "qwerty",
    isLive: cfg.sandbox === undefined
      ? process.env.SSL_IS_LIVE === "true"
      : !cfg.sandbox,
  };
};

// @desc    Initiate SSLCommerz payment for an order
// @route   POST /api/payment/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, customer } = req.body;

    if (!orderId || !amount || !customer) {
      return res
        .status(400)
        .json({
          success: false,
          message: "orderId, amount and customer are required",
        });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    if (order.payment.status === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already paid" });
    }

    const tran_id = `${order._id}_${Date.now()}`;

    const { storeId, storePassword, isLive } = await getSSLCommerzConfig();
    const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);

    const data = {
      total_amount: Number(amount),
      currency: "BDT",
      tran_id,
      success_url: `${process.env.FRONTEND_URL}/payment/success?tran_id=${tran_id}`,
      fail_url: `${process.env.FRONTEND_URL}/payment/fail?tran_id=${tran_id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?tran_id=${tran_id}`,
      ipn_url: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/payment/ipn?tran_id=${tran_id}`,
      productcategory: "General",
      product_name: "Apple IT Zone Order",
      product_category: "Electronics",
      product_profile: "general",
      shipping_method: "COURIER",
      num_of_item: order.items.length,
      ship_name: customer.name || "Customer",
      ship_add1: customer.address || "",
      ship_city: customer.city || "",
      ship_state: customer.state || "",
      ship_postcode: customer.postcode || "1207",
      ship_country: customer.country || "Bangladesh",
      cus_name: customer.name || "Customer",
      cus_email: customer.email || "",
      cus_phone: customer.phone || "",
      cus_add1: customer.address || "",
      cus_city: customer.city || "",
      cus_state: customer.state || "",
      cus_postcode: customer.postcode || "1207",
      cus_country: customer.country || "Bangladesh",
      value_a: order._id.toString(),
    };

    const apiResponse = await sslcz.init(data);

    if (apiResponse.status !== "SUCCESS" || !apiResponse.GatewayPageURL) {
      return res.status(400).json({
        success: false,
        message:
          apiResponse.failedreason || "Payment gateway could not be reached",
        details: apiResponse,
      });
    }

    order.payment.tran_id = tran_id;
    order.payment.amount = Number(amount);
    await order.save();

    res.json({
      success: true,
      gatewayUrl: apiResponse.GatewayPageURL,
      tran_id,
    });
  } catch (error) {
    console.error("SSLCommerz Initiate Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment initiation failed",
    });
  }
};

// @desc    Validate and update an order after SSLCommerz redirect/query
// @route   GET/POST /api/payment/validate
// @access  Public (called by SSLCommerz redirect)
export const validatePayment = async (req, res) => {
  try {
    const { val_id, tran_id, status } = req.body?.tran_id
      ? req.body
      : req.query;

    if (!tran_id) {
      return res
        .status(400)
        .json({ success: false, message: "tran_id is required" });
    }

    const order = await Order.findByTranId(tran_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    let validation = null;
    if (val_id) {
      const { storeId, storePassword, isLive } = await getSSLCommerzConfig();
      const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
      validation = await sslcz.validate({ val_id });
    }

    const success =
      status === "VALID" ||
      status === "VALIDATED" ||
      validation?.status === "VALID" ||
      validation?.status === "VALIDATED";

    if (success) {
      order.payment.status = "paid";
      order.payment.val_id = val_id || validation?.val_id || "";
      order.payment.card_type = validation?.card_type || "";
      order.payment.paidAt = order.payment.paidAt || new Date();
    } else if (status === "CANCELLED") {
      order.payment.status = "cancelled";
    } else {
      order.payment.status = "failed";
    }
    await order.save();

    res.json({ success: true, valid: success, order: order._id });
  } catch (error) {
    console.error("SSLCommerz Validate Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    SSLCommerz IPN listener (server-to-server)
// @route   POST /api/payment/ipn
// @access  Public (called by SSLCommerz)
export const ipnListener = async (req, res) => {
  try {
    const { status, tran_id, val_id, amount, card_type } = req.body;

    if (!tran_id) {
      return res
        .status(400)
        .json({ success: false, message: "tran_id is required" });
    }

    const order = await Order.findByTranId(tran_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    let success = status === "VALID" || status === "VALIDATED";

    if (!success && val_id) {
      const { storeId, storePassword, isLive } = await getSSLCommerzConfig();
      const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);
      const validation = await sslcz.validate({ val_id });
      success =
        validation?.status === "VALID" || validation?.status === "VALIDATED";
    }

    if (success) {
      order.payment.status = "paid";
      order.payment.val_id = val_id || "";
      order.payment.card_type = card_type || "";
      order.payment.amount = amount ? Number(amount) : order.payment.amount;
      order.payment.paidAt = order.payment.paidAt || new Date();
    } else if (status === "FAILED") {
      order.payment.status = "failed";
    } else if (status === "CANCELLED") {
      order.payment.status = "cancelled";
    }
    await order.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("SSLCommerz IPN Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark an order's payment as cancelled
// @route   GET/POST /api/payment/cancel
// @access  Public (called by SSLCommerz redirect)
export const cancelPayment = async (req, res) => {
  try {
    const { tran_id } = req.body?.tran_id ? req.body : req.query;

    if (!tran_id) {
      return res
        .status(400)
        .json({ success: false, message: "tran_id is required" });
    }

    const order = await Order.findByTranId(tran_id);
    if (order && order.payment.status === "pending") {
      order.payment.status = "cancelled";
      await order.save();
    }

    res.json({ success: true, message: "Payment cancelled" });
  } catch (error) {
    console.error("SSLCommerz Cancel Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
