'use client';
import { FeaturedProductsGrid } from './FeaturedProductsCard';
import { useState, useEffect } from 'react';

import { dummyProducts } from '@/data/dummy/products';
// Dummy product data (replace with your actual data fetching)

const FeaturedProducts = () => {
  const featuredProducts = dummyProducts.filter(
    (product) => product.isFeatured
  );
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState(featuredProducts);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-8 py-4">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <p className="text-gray-600 text-sm">
            Get Your Desired Product from Featured Products!
          </p>
        </div>
        <FeaturedProductsGrid
          products={products}
          columns={4}
          imageHeight={220}
          showCategory={true}
          isLoading={isLoading}
          skeletonCount={products.length}
        />
      </div>
    </>
  );
};

export default FeaturedProducts;
