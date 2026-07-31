// src/app/(store)/product/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { categoryApi, productApi } from '@/lib/api';
import type { Category } from '@/lib/api';
import { toProductShape, type RawProduct } from '@/lib/productMapper';
import type { Product } from '@/types/product';
import { ProductGrid } from '@/components/store/product/ProductGrid';
import { Breadcrumb } from '@/components/store/layout/Breadcrumb';
import { AddToCartButton } from '@/components/store/cart/AddToCartButton';
import { ChevronLeft, Star } from 'lucide-react';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Walk up the parentId chain to build the root -> leaf category list
function categoryChain(categories: Category[], name: string): Category[] {
  const cat = categories.find((c) => c.name === name);
  if (!cat) return [];
  const chain: Category[] = [];
  let current: Category | undefined = cat;
  while (current) {
    chain.unshift(current);
    current = categories.find((c) => c._id === current!.parentId);
  }
  return chain;
}

// Flatten specifications (structured or legacy flat format) into displayable sections
function renderSpecs(
  specs: Record<string, any>
): { label: string; items: { label: string; value: string }[] }[] {
  if (!specs || typeof specs !== 'object') return [];

  // new structured format
  if (specs._keySpecs || specs._keyFeatures || specs._specGroups) {
    const sections: {
      label: string;
      items: { label: string; value: string }[];
    }[] = [];
    if (specs._keySpecs && Object.keys(specs._keySpecs).length > 0) {
      sections.push({
        label: 'Key Specifications',
        items: Object.entries(specs._keySpecs).map(([k, v]) => ({
          label: k,
          value: String(v),
        })),
      });
    }
    if (specs._keyFeatures && Object.keys(specs._keyFeatures).length > 0) {
      sections.push({
        label: 'Key Features',
        items: Object.entries(specs._keyFeatures).map(([k, v]) => ({
          label: k,
          value: String(v),
        })),
      });
    }
    if (specs._specGroups && Object.keys(specs._specGroups).length > 0) {
      for (const [groupName, fields] of Object.entries(specs._specGroups)) {
        if (typeof fields === 'object' && fields !== null) {
          sections.push({
            label: groupName,
            items: Object.entries(fields).map(([k, v]) => ({
              label: k,
              value: String(v),
            })),
          });
        }
      }
    }
    return sections;
  }

  // legacy flat format
  const flatItems: { label: string; value: string }[] = [];
  const sections: {
    label: string;
    items: { label: string; value: string }[];
  }[] = [];
  for (const [key, val] of Object.entries(specs)) {
    if (typeof val === 'object' && val !== null) {
      sections.push({
        label: key,
        items: Object.entries(val).map(([k, v]) => ({
          label: k,
          value: String(v),
        })),
      });
    } else {
      flatItems.push({ label: key, value: String(val) });
    }
  }
  if (flatItems.length > 0)
    sections.unshift({ label: 'Specifications', items: flatItems });
  return sections;
}

export default function ProductDetailPage({ params }: Props) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { slug } = await params;
      try {
        const [prodRes, catRes, allRes] = await Promise.all([
          productApi.getBySlug(slug),
          categoryApi.getAll(),
          productApi.getAll({ limit: 1000 }),
        ]);
        if (prodRes.data.success) {
          const raw = prodRes.data.product as RawProduct;
          setProduct(toProductShape(raw));

          const cats: Category[] = catRes.data.categories || [];
          const primaryName =
            raw.categories && raw.categories.length > 0
              ? raw.categories[0]
              : raw.category;
          const chain = categoryChain(cats, primaryName);
          setCategorySlugs(chain.map((c) => c.slug));
          setCategoryPath(chain.map((c) => c.name));

          const relatedRaw = (allRes.data.products || []).filter(
            (p: RawProduct) =>
              p._id !== raw._id &&
              p.status !== 'draft' &&
              (p.categories || [p.category]).includes(primaryName)
          );
          setRelated(relatedRaw.slice(0, 4).map(toProductShape));
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-7xl m-auto px-4 py-8">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-2xl text-gray-500">Product not found</p>
        <Link
          href="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const finalPrice =
    product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const inStock = product.stock > 0;
  const stockText = inStock
    ? `In Stock (${product.stock} available)`
    : 'Out of Stock';
  const stockColor = inStock ? 'text-green-600' : 'text-red-600';

  return (
    <div className="max-w-7xl m-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb slug={categorySlugs} />

      <div className="mt-4">
        <Link
          href={`/products/${categorySlugs.join('/')}`}
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} />
          Back to {categoryPath[categoryPath.length - 1] || 'Category'}
        </Link>
      </div>

      {/* Product Main Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={product.images[0] || '/placeholder-image.png'}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          {/* Thumbnail Strip (if more images) */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition"
                >
                  <Image
                    src={img}
                    alt={`${product.name} - view ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>
            {product.specifications?.brand && (
              <p className="text-sm text-gray-500 mt-1">
                Brand: {product.specifications.brand}
              </p>
            )}
          </div>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={
                      i < Math.round(product.averageRating)
                        ? 'currentColor'
                        : 'none'
                    }
                    className={
                      i < Math.round(product.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({product.ratings?.length || 0} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-green-700">
                ৳{finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600 mt-1">
                You save ৳{(product.price - finalPrice).toLocaleString()} (
                {discountPercent}%)
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className={`font-medium ${stockColor}`}>{stockText}</span>
            {inStock && product.stock < 10 && (
              <span className="text-sm text-orange-600">
                🔥 Only {product.stock} left!
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800">Description</h3>
            <p className="text-gray-600 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {renderSpecs(product.specifications || {}).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800">Specifications</h3>
              <div className="mt-2 space-y-4">
                {renderSpecs(product.specifications || {}).map((section) => (
                  <div key={section.label}>
                    <h4 className="text-sm font-semibold text-gray-700">
                      {section.label}
                    </h4>
                    <dl className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                      {section.items.map((item) => (
                        <div
                          key={item.label}
                          className="flex py-1 border-b border-gray-100"
                        >
                          <dt className="w-1/2 font-medium text-gray-600 capitalize">
                            {item.label.replace(/-/g, ' ')}
                          </dt>
                          <dd className="w-1/2 text-gray-800">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="pt-4">
            <AddToCartButton product={product} />
          </div>

          {/* Extra info */}
          <div className="text-xs text-gray-400 flex gap-4 pt-2">
            <span>✅ Secure Payment</span>
            <span>🚚 Free Delivery (BD)</span>
            <span>🔄 7 Days Return</span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <ProductGrid products={related} columns={4} />
        </div>
      )}
    </div>
  );
}
