import { getSmsSetting } from '../models/SmsSetting.js';
import SmsLog from '../models/SmsLog.js';
import StoreSetting from '../models/StoreSetting.js';

const BULKSMS_BASE = 'https://bulksmsbd.net/api';

// Normalize a BD number: 01712345678 -> 8801712345678, keeps 8801xxxxxxxxx as-is
function normalizeNumber(num) {
  let n = String(num).replace(/[^\d]/g, '');
  if (!n) return '';
  if (n.startsWith('880')) return n;
  if (n.startsWith('0') && n.length === 11) return `88${n}`;
  return n;
}

function parseNumbers(input) {
  if (Array.isArray(input)) {
    return [...new Set(input.map(normalizeNumber).filter(Boolean))];
  }
  return [...new Set(String(input).split(/[\s,;]+/).map(normalizeNumber).filter(Boolean))];
}

async function getStore() {
  const s = await StoreSetting.findOne();
  return {
    name: s?.storeName || 'Apple IT Zone',
    phone: s?.phone || '',
  };
}

// Core send helper. Never throws — returns a result object so callers
// (order flow, auth flow, admin controller) never break on SMS failures.
export async function sendSms({ numbers, message, senderId }) {
  const result = {
    success: false,
    skipped: false,
    reason: '',
    log: null,
    numbers: [],
  };

  const setting = await getSmsSetting();
  if (!setting.apiKey) {
    result.skipped = true;
    result.reason = 'SMS API key is not configured';
    return result;
  }
  if (!setting.enabled) {
    result.skipped = true;
    result.reason = 'SMS sending is disabled';
    return result;
  }

  const toList = parseNumbers(numbers);
  if (toList.length === 0) {
    result.reason = 'No valid Bangladesh phone numbers provided';
    return result;
  }

  const useSender = (senderId && String(senderId).trim()) || setting.senderId || '';
  const fullMessage = setting.signature
    ? `${String(message).trim()}\n${setting.signature}`
    : String(message).trim();

  const body = new URLSearchParams();
  body.append('api_key', setting.apiKey);
  if (useSender) body.append('senderid', useSender);
  body.append('number', toList.join(','));
  body.append('message', fullMessage);

  try {
    const resp = await fetch(`${BULKSMS_BASE}/smsapi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await resp.json();

    const responseCode = data?.response_code ?? data?.status_code ?? null;
    const sent =
      String(responseCode) === '202' ||
      data.status === 'SMS_SENT' ||
      data.status === 'SUCCESS' ||
      (typeof responseCode === 'number' && responseCode >= 200 && responseCode < 300);

    const log = await SmsLog.create({
      to: toList,
      message: fullMessage,
      segments: Math.max(1, Math.ceil(fullMessage.length / 160)),
      status: sent ? 'sent' : 'failed',
      providerStatus: String(responseCode ?? data.status ?? ''),
      providerMessage: data.success_message || data.error_message || data.message || '',
      errorCode: String(responseCode ?? ''),
      raw: data,
    });

    return { ...result, success: sent, log, numbers: toList };
  } catch (error) {
    return { ...result, reason: error.message };
  }
}

const orderId = (order) => `ORD-${order._id.toString().slice(-5).toUpperCase()}`;

// Customer order placed confirmation
export async function notifyOrderPlaced({ order, name, phone }) {
  const store = await getStore();
  const message =
    `Hello ${name}, your order ${orderId(order)} at ${store.name} has been confirmed. ` +
    `Total: ৳${order.totalAmount}. We will call you soon for delivery.`;
  return sendSms({ numbers: phone, message });
}

// Customer order cancelled
export async function notifyOrderCancelled({ order, name, phone }) {
  const store = await getStore();
  const refund =
    order.payment?.status === 'paid'
      ? ' Your refund is being processed.'
      : '';
  const message =
    `Hello ${name}, your order ${orderId(order)} at ${store.name} has been cancelled.${refund} ` +
    (store.phone
      ? `Contact us at ${store.phone} if you have any questions.`
      : 'Contact us for any questions.');
  return sendSms({ numbers: phone, message });
}

// Password reset OTP
export async function sendPasswordResetOtp({ phone, otp }) {
  const store = await getStore();
  const message =
    `${store.name} password reset code: ${otp}. ` +
    `Valid for 10 minutes. Do not share this code with anyone.`;
  return sendSms({ numbers: phone, message });
}
