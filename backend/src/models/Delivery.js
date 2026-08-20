import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    // Link back to our store order (optional but recommended).
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

    // Pathao consignment id, e.g. PTW-XXXX
    consignmentId: { type: String, trim: true, default: '' },
    merchantOrderId: { type: String, trim: true, default: '' },

    storeId: { type: Number, default: null },

    recipient: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      secondaryPhone: { type: String, default: '' },
      address: { type: String, required: true },
      cityId: { type: Number, default: null },
      zoneId: { type: Number, default: null },
      areaId: { type: Number, default: null },
      cityName: { type: String, default: '' },
      zoneName: { type: String, default: '' },
      areaName: { type: String, default: '' },
    },

    deliveryType: { type: Number, default: 48 }, // 48 = Normal, 12 = On-Demand
    itemType: { type: Number, default: 2 }, // 1 = Document, 2 = Parcel
    itemQuantity: { type: Number, default: 1 },
    itemWeight: { type: Number, default: 0.5 },
    amountToCollect: { type: Number, default: 0 }, // COD amount
    specialInstruction: { type: String, default: '' },
    itemDescription: { type: String, default: '' },

    // Local lifecycle status.
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
      default: 'pending',
    },
    // Raw status returned by Pathao.
    pathaoStatus: { type: String, default: '' },
    deliveryFee: { type: Number, default: 0 },
    trackingUrl: { type: String, default: '' },

    history: [
      {
        status: { type: String, default: '' },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Indexes for fast admin listing / search.
deliverySchema.index({ status: 1 });
deliverySchema.index({ consignmentId: 1 });
deliverySchema.index({ merchantOrderId: 1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
