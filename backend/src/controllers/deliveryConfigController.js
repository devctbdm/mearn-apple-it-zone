import DeliveryConfig from '../models/DeliveryConfig.js';
import { invalidateConfigCache } from '../services/pathaoService.js';

const DEFAULTS = () => ({
  key: 'pathao',
  enabled: true,
  sandbox: process.env.BASE_URL?.includes('sandbox') ?? true,
  baseUrl:
    process.env.BASE_URL || 'https://courier-api-sandbox.pathao.com',
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  username: process.env.USERNAME || '',
  password: process.env.PASSWORD || '',
  storeId: process.env.STORE_ID || '',
  storeName: 'Apple IT Zone — Main Store',
  senderName: 'Apple IT Zone',
  senderPhone: '01711223344',
  senderAddress: 'House 12, Road 5, Dhanmondi, Dhaka 1205',
  defaultWeight: '0.5',
  defaultItemType: 'Parcel',
  defaultDeliveryType: 'Normal (48-72h)',
  webhookSecret:
    process.env.PATHAO_WEBHOOK_SECRET || 'f3992ecc-59da-4cbe-a049-a13da2018d51',
  webhookUrl: process.env.PATHAO_WEBHOOK_URL || '',
});

// @desc    Get the current Pathao config (seeds defaults on first call)
// @route   GET /api/deliveries/pathao/config
export const getPathaoConfig = async (req, res) => {
  try {
    let cfg = await DeliveryConfig.findOne({ key: 'pathao' });
    if (!cfg) {
      cfg = await DeliveryConfig.create(DEFAULTS());
    }
    res.json({ success: true, config: cfg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update the Pathao config from the admin settings page
// @route   PUT /api/deliveries/pathao/config
export const updatePathaoConfig = async (req, res) => {
  try {
    const body = req.body || {};
    const update = {
      enabled: Boolean(body.enabled),
      sandbox: Boolean(body.sandbox),
      baseUrl: String(body.baseUrl || 'https://courier-api-sandbox.pathao.com'),
      clientId: String(body.clientId || ''),
      clientSecret: String(body.clientSecret || ''),
      username: String(body.username || ''),
      password: String(body.password || ''),
      storeId: String(body.storeId || ''),
      storeName: String(body.storeName || ''),
      senderName: String(body.senderName || ''),
      senderPhone: String(body.senderPhone || ''),
      senderAddress: String(body.senderAddress || ''),
      defaultWeight: String(body.defaultWeight || '0.5'),
      defaultItemType: String(body.defaultItemType || 'Parcel'),
      defaultDeliveryType: String(body.defaultDeliveryType || 'Normal (48-72h)'),
      webhookSecret: String(body.webhookSecret || ''),
      webhookUrl: String(body.webhookUrl || ''),
    };
    const cfg = await DeliveryConfig.findOneAndUpdate({ key: 'pathao' }, update, {
      new: true,
      upsert: true,
    });
    invalidateConfigCache();
    res.json({ success: true, config: cfg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
