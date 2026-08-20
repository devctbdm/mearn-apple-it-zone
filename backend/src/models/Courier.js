import mongoose from 'mongoose';

const courierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Pathao"
    slug: { type: String, required: true, unique: true, index: true }, // e.g. "pathao"
    active: { type: Boolean, default: true },
    description: { type: String, default: '' },
    // Courier-specific config (API base, etc.). For Pathao this is unused
    // (creds come from env), but kept for future couriers.
    config: { type: Object, default: {} },
    color: { type: String, default: '#C2410C' }, // UI accent
  },
  { timestamps: true }
);

const Courier = mongoose.model('Courier', courierSchema);

export default Courier;
