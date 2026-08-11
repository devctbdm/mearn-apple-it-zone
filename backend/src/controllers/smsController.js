import { getSmsSetting } from '../models/SmsSetting.js';
import SmsLog from '../models/SmsLog.js';

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

// @desc    Get SMS settings (admin only)
// @route   GET /api/sms/settings
export const getSettings = async (req, res) => {
  try {
    const setting = await getSmsSetting();
    res.json({
      success: true,
      settings: {
        apiKey: setting.apiKey || '',
        senderId: setting.senderId || '',
        signature: setting.signature || '',
        enabled: !!setting.enabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update SMS settings (admin only)
// @route   PUT /api/sms/settings
export const updateSettings = async (req, res) => {
  try {
    const { apiKey, senderId, signature, enabled } = req.body;
    const setting = await getSmsSetting();
    if (typeof apiKey === 'string') setting.apiKey = apiKey.trim();
    if (typeof senderId === 'string') setting.senderId = senderId.trim();
    if (typeof signature === 'string') setting.signature = signature.trim();
    if (typeof enabled === 'boolean') setting.enabled = enabled;
    await setting.save();
    res.json({
      success: true,
      settings: {
        apiKey: setting.apiKey || '',
        senderId: setting.senderId || '',
        signature: setting.signature || '',
        enabled: !!setting.enabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check bulksmsbd.net account balance (admin only)
// @route   GET /api/sms/balance
export const getBalance = async (req, res) => {
  try {
    const setting = await getSmsSetting();
    if (!setting.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key not configured. Save it in SMS settings first.',
      });
    }
    const url = `${BULKSMS_BASE}/getBalanceApi?api_key=${encodeURIComponent(setting.apiKey)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    res.json({ success: true, balance: data });
  } catch (error) {
    console.error('SMS Balance Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send an SMS via bulksmsbd.net (admin only)
// @route   POST /api/sms/send
export const sendSms = async (req, res) => {
  try {
    const { numbers, message, senderId } = req.body;
    if (!numbers) {
      return res.status(400).json({ success: false, message: 'Please provide at least one phone number' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const setting = await getSmsSetting();
    if (!setting.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key not configured. Save it in SMS settings first.',
      });
    }
    if (!setting.enabled) {
      return res.status(400).json({
        success: false,
        message: 'SMS sending is disabled. Enable it in SMS settings.',
      });
    }

    const toList = parseNumbers(numbers);
    if (toList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid Bangladesh phone numbers provided (e.g. 017xxxxxxxx or 88017xxxxxxxx).',
      });
    }

    const useSender = (senderId && String(senderId).trim()) || setting.senderId || '';
    let fullMessage = String(message).trim();
    if (setting.signature) {
      fullMessage = `${fullMessage}\n${setting.signature}`;
    }

    const body = new URLSearchParams();
    body.append('api_key', setting.apiKey);
    if (useSender) body.append('senderid', useSender);
    body.append('number', toList.join(','));
    body.append('message', fullMessage);

    const resp = await fetch(`${BULKSMS_BASE}/smsapi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await resp.json();

    const sent = data.status === 'SMS_SENT' || data.status === 'SUCCESS' || String(data.status_code) === '202';

    const log = await SmsLog.create({
      to: toList,
      message: fullMessage,
      segments: Math.max(1, Math.ceil(fullMessage.length / 160)),
      status: sent ? 'sent' : 'failed',
      providerStatus: data.status || '',
      providerMessage: data.message || '',
      errorCode: String(data.status_code || ''),
      raw: data,
      sentBy: req.user?._id,
    });

    res.json({
      success: sent,
      log,
      provider: data,
      numbers: toList,
    });
  } catch (error) {
    console.error('SMS Send Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Paginated SMS send history (admin only)
// @route   GET /api/sms/logs
export const getLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
    const total = await SmsLog.countDocuments();
    const logs = await SmsLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({
      success: true,
      logs,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
