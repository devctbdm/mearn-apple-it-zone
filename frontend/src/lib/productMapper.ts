// src/lib/productMapper.ts
import type { Product } from '@/types/product';

export type RawProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  category: string;
  categories?: string[];
  images: string[];
  stock: number;
  status: string;
  featured: boolean;
  specifications: Record<string, any>;
  ratings: any[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
};

export function toProductShape(p: RawProduct): Product {
  return {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.price || 0,
    discountPrice: p.discountPrice || 0,
    category: p.category || '',
    path: [],
    images: p.images || [],
    stock: p.stock ?? 0,
    specifications: p.specifications || {},
    averageRating: p.averageRating || 0,
    ratings: p.ratings || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
