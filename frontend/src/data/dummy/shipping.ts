// src/data/dummy/shipping.ts

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  zone: string;
  isActive: boolean;
  isDefault: boolean;
  carrier: string;
  trackingAvailable: boolean;
}

export const dummyShippingMethods: ShippingMethod[] = [
  {
    id: "ship_001",
    name: "Standard Delivery",
    description: "Regular delivery within 3-5 business days",
    price: 150,
    estimatedDays: "3-5",
    zone: "Dhaka",
    isActive: true,
    isDefault: true,
    carrier: "Pathao",
    trackingAvailable: true,
  },
  {
    id: "ship_002",
    name: "Express Delivery",
    description: "Fast delivery within 24 hours",
    price: 350,
    estimatedDays: "1",
    zone: "Dhaka",
    isActive: true,
    isDefault: false,
    carrier: "RedX",
    trackingAvailable: true,
  },
  {
    id: "ship_003",
    name: "Outside Dhaka - Standard",
    description: "Delivery to other districts within 5-7 days",
    price: 250,
    estimatedDays: "5-7",
    zone: "Outside Dhaka",
    isActive: true,
    isDefault: true,
    carrier: "Sundarban Courier",
    trackingAvailable: true,
  },
  {
    id: "ship_004",
    name: "Outside Dhaka - Express",
    description: "Fast delivery to other districts within 2-3 days",
    price: 450,
    estimatedDays: "2-3",
    zone: "Outside Dhaka",
    isActive: false,
    isDefault: false,
    carrier: "SA Paribahan",
    trackingAvailable: true,
  },
  {
    id: "ship_005",
    name: "Cash on Delivery",
    description: "Pay when you receive the package",
    price: 0,
    estimatedDays: "3-5",
    zone: "All Zones",
    isActive: true,
    isDefault: false,
    carrier: "N/A",
    trackingAvailable: false,
  },
  {
    id: "ship_006",
    name: "International Shipping",
    description: "Shipping to international destinations",
    price: 1500,
    estimatedDays: "10-15",
    zone: "International",
    isActive: false,
    isDefault: false,
    carrier: "DHL",
    trackingAvailable: true,
  },
  {
    id: "ship_007",
    name: "Next Day Delivery",
    description: "Guaranteed next business day delivery",
    price: 500,
    estimatedDays: "1",
    zone: "Dhaka",
    isActive: true,
    isDefault: false,
    carrier: "RedX Premium",
    trackingAvailable: true,
  },
  {
    id: "ship_008",
    name: "Free Shipping",
    description: "Free shipping for orders above 5,000 BDT",
    price: 0,
    estimatedDays: "4-6",
    zone: "All Zones",
    isActive: true,
    isDefault: false,
    carrier: "Multiple",
    trackingAvailable: false,
  },
  {
    id: "ship_009",
    name: "Chittagong Express",
    description: "Fast delivery within Chittagong city",
    price: 200,
    estimatedDays: "1-2",
    zone: "Chittagong",
    isActive: true,
    isDefault: false,
    carrier: "SA Paribahan",
    trackingAvailable: true,
  },
  {
    id: "ship_010",
    name: "Bulk Order Shipping",
    description: "Special shipping for bulk orders (10+ kg)",
    price: 800,
    estimatedDays: "3-5",
    zone: "All Zones",
    isActive: false,
    isDefault: false,
    carrier: "Sundarban Courier",
    trackingAvailable: true,
  },
];

// Shipping zones for filter
export const shippingZones = [
  "All",
  "Dhaka",
  "Outside Dhaka",
  "Chittagong",
  "All Zones",
  "International",
];

// Shipping carriers for filter
export const shippingCarriers = [
  "All",
  "Pathao",
  "RedX",
  "RedX Premium",
  "Sundarban Courier",
  "SA Paribahan",
  "DHL",
  "Multiple",
  "N/A",
];
