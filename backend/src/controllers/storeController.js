import StoreSetting from '../models/StoreSetting.js';

export const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = await StoreSetting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, storeUrl, email, phone, description, logoUrl, currency, timezone, address } = req.body;
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting();
    }
    if (storeName !== undefined) settings.storeName = storeName;
    if (storeUrl !== undefined) settings.storeUrl = storeUrl;
    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (description !== undefined) settings.description = description;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (currency !== undefined) settings.currency = currency;
    if (timezone !== undefined) settings.timezone = timezone;
    if (address !== undefined) settings.address = address;
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
