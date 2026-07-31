// src/components/store/product/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Product } from '@/types/product';
import { AddToCartButton } from '../cart/AddToCartButton';
import { cardHover, imageZoom, scaleIn } from '@/lib/animations';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const finalPrice =
    product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const imageUrl = imageError
    ? `https://placehold.co/600x400/1a1a2e/white?text=${encodeURIComponent(product.name)}`
    : product.images[0] ||
      `https://placehold.co/600x400/1a1a2e/white?text=No+Image`;

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
    >
      {/* Image Section */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative overflow-hidden"
      >
        <motion.div
          variants={imageZoom}
          initial="initial"
          whileHover="hover"
          className="relative h-48 md:h-56 w-full bg-gray-100"
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageError(true)}
            priority={false}
          />
        </motion.div>

        {/* Discount Badge */}
        {hasDiscount && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
          >
            -{discountPercent}%
          </motion.span>
        )}

        {/* Stock indicator */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-lg bg-red-600/90 px-4 py-2 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 md:p-5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2 min-h-12">
            {product.name}
          </h3>
        </Link>

        {/* Price Section */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-green-700">
            ৳{finalPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm text-gray-600">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.ratings?.length || 0})
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mt-4">
          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
};
