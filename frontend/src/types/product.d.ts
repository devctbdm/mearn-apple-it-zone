// src/types/product.types.ts
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  category: string; // e.g., 'desktops', 'laptops', 'components'
  path: string[]; // ⭐ NEW: e.g., ['desktops', 'gaming', 'intel']
  images: string[];
  stock: number;
  specifications?: Record<string, string | number>;
  averageRating: number;
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
}
