export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number; // Max available
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface CheckoutData {
  shippingAddress: ShippingAddress;
  paymentMethod: 'sslcommerz' | 'cod' | 'bkash' | 'nagad';
  notes?: string;
}
