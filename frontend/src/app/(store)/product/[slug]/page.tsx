// src/app/(store)/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/data/products.dummy';
import { ProductGrid } from '@/components/store/product/ProductGrid';
import { Breadcrumb } from '@/components/store/layout/Breadcrumb';
import { AddToCartButton } from '@/components/store/cart/AddToCartButton';
import { ChevronLeft, Star, ShoppingBag } from 'lucide-react';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // If product not found, show 404
  if (!product) {
    notFound();
  }

  const finalPrice =
    product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  // Related products (same category)
  const relatedProducts = getRelatedProducts(product, 4);

  // Build category path for breadcrumb from product.path
  // Remove the last segment (which is the product-specific segment like 'core-i9')
  const categorySlug = product.path.slice(0, -1);

  // Determine stock status
  const inStock = product.stock > 0;
  const stockText = inStock
    ? `In Stock (${product.stock} available)`
    : 'Out of Stock';
  const stockColor = inStock ? 'text-green-600' : 'text-red-600';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb slug={categorySlug} />

      <div className="mt-4">
        <Link
          href={`/${categorySlug.join('/')}`}
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          <ChevronLeft size={16} />
          Back to Category
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
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800">Specifications</h3>
                <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex py-1 border-b border-gray-100"
                      >
                        <dt className="w-1/2 font-medium text-gray-600 capitalize">
                          {key.replace(/-/g, ' ')}
                        </dt>
                        <dd className="w-1/2 text-gray-800">{value}</dd>
                      </div>
                    )
                  )}
                </dl>
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
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </div>
      )}
    </div>
  );
}

// Optional: Generate static paths for all products (for ISR / SSG)
export async function generateStaticParams() {
  const { dummyProducts } = await import('@/data/products.dummy');
  return dummyProducts.map((product) => ({
    slug: product.slug,
  }));
}
