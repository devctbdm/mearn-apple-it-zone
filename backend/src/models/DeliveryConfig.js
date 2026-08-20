import mongoose from 'mongoose';

// Singleton config document for the Pathao courier integration.
// Admins edit these from the admin Pathao settings page; pathaoService
// reads them at request time (with env fallback for first boot).
const deliveryConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'pathao', unique: true, index: true },
    enabled: { type: Boolean, default: true },
    sandbox: { type: Boolean, default: true },
    baseUrl: { type: String, default: 'https://courier-api-sandbox.pathao.com' },
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    storeId: { type: String, default: '' },
    storeName: { type: String, default: '' },
    senderName: { type: String, default: '' },
    senderPhone: { type: String, default: '' },
    senderAddress: { type: String, default: '' },
    defaultWeight: { type: String, default: '0.5' },
    defaultItemType: { type: String, default: 'Parcel' },
    defaultDeliveryType: { type: String, default: 'Normal (48-72h)' },
    webhookSecret: { type: String, default: '' },
    webhookUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const DeliveryConfig = mongoose.model('DeliveryConfig', deliveryConfigSchema);

export default DeliveryConfig;
