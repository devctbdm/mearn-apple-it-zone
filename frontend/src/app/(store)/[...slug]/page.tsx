// src/app/(store)/[...slug]/page.tsx
'use client'; // Using client for loading states

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  dummyProducts,
  filterProductsByPath,
  getTitleFromSlug,
} from '@/data/products.dummy';
import { ProductGrid } from '@/components/store/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/store/product/ProductGridSkeleton';
import { Breadcrumb } from '@/components/store/layout/Breadcrumb';
import { PageTransition } from '@/components/shared/PageTransition';

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

export default function CategoryPage({ params }: Props) {
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string[]>([]);

  useEffect(() => {
    const fetchSlug = async () => {
      const resolved = await params;
      setSlug(resolved.slug || []);
      setLoading(false);
    };
    fetchSlug();
  }, [params]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-6 bg-gray-200 rounded w-64 mb-4" />
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  const filteredProducts = filterProductsByPath(dummyProducts, slug);
  const pageTitle = getTitleFromSlug(slug);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb slug={slug} />
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 mt-1">
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} columns={4} />
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500">
              No products found in this category.
            </p>
            <a
              href="/"
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              ← Back to Home
            </a>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
