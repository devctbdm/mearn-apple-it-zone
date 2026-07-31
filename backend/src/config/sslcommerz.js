// backend/src/config/sslcommerz.js

import SSLCommerzPayment from 'sslcommerz-lts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ---- Read credentials from .env ----
const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
const is_live = process.env.SSL_IS_LIVE === 'true'; // "true" => live, otherwise sandbox

// ---- Validate required credentials ----
if (!store_id || !store_passwd) {
  console.error(
    '❌ SSLCommerz credentials are missing. Please set SSL_STORE_ID and SSL_STORE_PASSWORD in .env'
  );
  // Optionally, throw an error to stop the app
  // throw new Error('SSLCommerz credentials missing');
}

// ---- URL endpoints (for redirects) ----
const success_url = process.env.SSL_SUCCESS_URL || 'http://localhost:3000/payment-success';
const fail_url = process.env.SSL_FAIL_URL || 'http://localhost:3000/payment-fail';
const cancel_url = process.env.SSL_CANCEL_URL || 'http://localhost:3000/payment-cancel';
const ipn_url = process.env.SSL_IPN_URL || 'http://localhost:5000/api/payment/ipn';

// ---- Create a configured SSLCommerz instance ----
const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);

// ---- Export everything needed ----
export {
  sslcommerz, // the SSLCommerzPayment instance (use for init/validate)
  store_id,
  store_passwd,
  is_live,
  success_url,
  fail_url,
  cancel_url,
  ipn_url,
};

// Optionally, export a default object for convenience
export default {
  sslcommerz,
  store_id,
  store_passwd,
  is_live,
  success_url,
  fail_url,
  cancel_url,
  ipn_url,
};
