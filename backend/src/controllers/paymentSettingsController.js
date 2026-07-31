import PaymentGateway from '../models/PaymentGateway.js';

export const getPaymentGateways = async (req, res) => {
  try {
    let gateways = await PaymentGateway.find().sort({ name: 1 });
    if (gateways.length === 0) {
      await PaymentGateway.insertMany([
        {
          name: 'bKash',
          enabled: false,
          config: { merchantNumber: '', apiKey: '', secretKey: '' },
        },
        {
          name: 'SSLCommerz',
          enabled: false,
          config: {
            storeId: process.env.SSL_STORE_ID || '',
            storePassword: process.env.SSL_STORE_PASSWORD || '',
            isLive: process.env.SSL_IS_LIVE === 'true',
          },
        },
      ]);
      gateways = await PaymentGateway.find().sort({ name: 1 });
    }
    res.json({ success: true, gateways });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentGateway = async (req, res) => {
  try {
    const { enabled, config } = req.body;
    const gateway = await PaymentGateway.findById(req.params.id);
    if (!gateway) {
      return res.status(404).json({ success: false, message: 'Gateway not found' });
    }
    if (enabled !== undefined) gateway.enabled = enabled;
    if (config !== undefined) gateway.config = { ...gateway.config, ...config };
    await gateway.save();
    res.json({ success: true, gateway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
