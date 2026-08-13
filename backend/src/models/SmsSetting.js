import mongoose from 'mongoose';

const smsSettingSchema = new mongoose.Schema(
  {
    apiKey: { type: String, default: '' },
    senderId: { type: String, default: '' },
    signature: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    otpExpirySeconds: { type: Number, default: 60, min: 15, max: 900 },
  },
  { timestamps: true }
);

const SmsSetting = mongoose.model('SmsSetting', smsSettingSchema);

export async function getSmsSetting() {
  let setting = await SmsSetting.findOne();
  if (!setting) {
    setting = await SmsSetting.create({});
  }
  return setting;
}

export default SmsSetting;
