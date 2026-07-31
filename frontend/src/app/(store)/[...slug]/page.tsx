// src/app/(store)/[...slug]/page.tsx
'use client'; // Using client for loading states

import { useEffect, useState } from 'react';
import { categoryApi, productApi } from '@/lib/api';
import type { Category } from '@/lib/api';
import { toProductShape, type RawProduct } from '@/lib/productMapper';
import { ProductGrid } from '@/components/store/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/store/product/ProductGridSkeleton';
import { Breadcrumb } from '@/components/store/layout/Breadcrumb';
import { PageTransition } from '@/components/shared/PageTransition';

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

// Collect the category name plus all descendant category names (via parentId chain)
function collectCategoryNames(
  categories: Category[],
  rootId: string
): string[] {
  const names: string[] = [];
  const stack: string[] = [rootId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    const cat = categories.find((c) => c._id === id);
    if (!cat) continue;
    names.push(cat.name);
    for (const c of categories) {
      if (c.parentId === id) stack.push(c._id);
    }
  }
  return names;
}

export default function CategoryPage({ params }: Props) {
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<RawProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const resolved = await params;
      setSlug(resolved.slug || []);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ limit: 1000 }),
        ]);
        setCategories(catRes.data.categories || []);
        setProducts(prodRes.data.products || []);
      } catch {
        // leave empty on failure
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-7xl m-auto px-4 py-8">
        <div className="h-6 bg-gray-200 rounded w-64 mb-4" />
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  // Strip the optional "products" prefix segment (e.g. /products/all-pc -> ["products", "all-pc"])
  const path = slug[0] === 'products' ? slug.slice(1) : slug;

  // Resolve each slug segment to a category; the last resolved one defines the scope
  let scopeId: string | null = null;
  const titleSegments: string[] = [];
  for (const segment of path) {
    const cat = categories.find((c) => c.slug === segment.toLowerCase());
    if (!cat) break;
    scopeId = cat._id;
    titleSegments.push(cat.name);
  }

  const scopeNames = scopeId
    ? new Set(collectCategoryNames(categories, scopeId))
    : null;

  const visibleProducts = products
    .filter((p) => p.status !== 'draft')
    .filter((p) => {
      if (!scopeNames) return true;
      const names =
        p.categories && p.categories.length > 0 ? p.categories : [p.category];
      return names.some((n) => scopeNames.has(n));
    })
    .map(toProductShape);

  const pageTitle =
    titleSegments.length > 0
      ? titleSegments.join(' > ')
      : path.length === 0
        ? 'All Products'
        : path
            .map(
              (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
            )
            .join(' > ');

  return (
    <PageTransition>
      <div className="max-w-7xl m-auto px-4 py-8">
        <Breadcrumb slug={path} />
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 mt-1">
            {visibleProducts.length}{' '}
            {visibleProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        {visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} columns={4} />
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
