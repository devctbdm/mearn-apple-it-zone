// backend/src/models/PromoCode.js

import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a promo code'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'Code cannot be more than 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      default: 'percentage',
    },
    value: {
      type: Number,
      required: [true, 'Please provide a discount value'],
      min: [0, 'Value cannot be negative'],
    },
    minOrder: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Max discount cannot be negative'],
    },
    maxUses: {
      type: Number,
      default: 0,
      min: [0, 'Max uses cannot be negative'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [0, 'Per-user limit cannot be negative'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ---- Check whether the code is currently redeemable ----
promoSchema.methods.isActive = function (now = new Date()) {
  if (this.status !== 'active') return false;
  if (this.startDate && new Date(this.startDate) > now) return false;
  if (this.endDate && new Date(this.endDate) < now) return false;
  if (this.maxUses > 0 && this.usageCount >= this.maxUses) return false;
  return true;
};

// ---- Compute the discount for a given subtotal ----
promoSchema.methods.computeDiscount = function (subtotal) {
  const now = new Date();
  if (!this.isActive(now)) {
    return { valid: false, reason: 'inactive', discount: 0 };
  }
  if (this.minOrder > 0 && subtotal < this.minOrder) {
    return { valid: false, reason: 'min-order', discount: 0 };
  }

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (subtotal * this.value) / 100;
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === 'fixed') {
    discount = this.value;
  }
  // free_shipping handled at checkout; no amount discount here

  discount = Math.min(discount, subtotal);
  return { valid: true, reason: null, discount };
};

// ---- Indexes ----
promoSchema.index({ code: 1 });
promoSchema.index({ status: 1, createdAt: -1 });

const PromoCode = mongoose.model('PromoCode', promoSchema);
export default PromoCode;
