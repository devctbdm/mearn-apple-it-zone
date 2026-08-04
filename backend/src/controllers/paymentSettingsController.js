import PaymentGateway from '../models/PaymentGateway.js';

export const getPaymentGateways = async (req, res) => {
  try {
    let gateways = await PaymentGateway.find().sort({ name: 1 });
    if (gateways.length === 0) {
      await PaymentGateway.insertMany([
        {
          name: 'bKash',
          enabled: false,
          config: {
            label: 'bKash',
            description: 'Pay using your bKash wallet',
            appKey: '',
            appSecret: '',
            username: '',
            password: '',
          },
        },
        {
          name: 'SSLCommerz',
          enabled: false,
          config: {
            label: 'SSLCommerz',
            description: 'Pay with card, bKash, Nagad or internet banking via SSLCommerz',
            sandbox: process.env.SSL_IS_LIVE !== 'true',
            storeId: process.env.SSL_STORE_ID || '',
            storePassword: process.env.SSL_STORE_PASSWORD || '',
            isLocalhost: false,
          },
        },
      ]);
      gateways = await PaymentGateway.find().sort({ name: 1 });
    }

    // Merge any missing default config keys so older docs stay complete
    const defaults = {
      bKash: {
        label: 'bKash',
        description: 'Pay using your bKash wallet',
        appKey: '',
        appSecret: '',
        username: '',
        password: '',
      },
      SSLCommerz: {
        label: 'SSLCommerz',
        description: 'Pay with card, bKash, Nagad or internet banking via SSLCommerz',
        sandbox: process.env.SSL_IS_LIVE !== 'true',
        storeId: process.env.SSL_STORE_ID || '',
        storePassword: process.env.SSL_STORE_PASSWORD || '',
        isLocalhost: false,
      },
    };
    gateways = gateways.map((g) => {
      const doc = g.toObject();
      doc.config = { ...(defaults[doc.name] || {}), ...(doc.config || {}) };
      return doc;
    });

    res.json({ success: true, gateways });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public endpoint used by the storefront checkout. Returns only enabled
// gateways and only non-sensitive display config (label/description).
export const getActivePaymentGateways = async (req, res) => {
  try {
    const gateways = await PaymentGateway.find({ enabled: true }).sort({ name: 1 });
    const safe = gateways.map((g) => ({
      name: g.name,
      label: g.config?.label || g.name,
      description: g.config?.description || '',
    }));
    res.json({ success: true, gateways: safe });
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
    if (enabled !== undefined) {
      gateway.enabled = enabled;
    }
    if (config !== undefined) {
      gateway.config = { ...gateway.config, ...config };
    }
    await gateway.save();
    res.json({ success: true, gateway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
