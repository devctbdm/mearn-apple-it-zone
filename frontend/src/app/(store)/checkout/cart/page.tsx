// src/app/(store)/checkout/cart/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/store';
import { CartItemCard } from '@/components/store/cart/CartItem';
import { Button } from '@/components/button/Button';

const CartPage = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();

  const totalSavings = items.reduce(
    (sum, item) => sum + item.promoDiscount * item.quantity,
    0
  );
  const originalSubtotal = totalPrice + totalSavings;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
        Shopping Cart
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {totalItems > 0
          ? `${totalItems} item${totalItems === 1 ? '' : 's'} in your cart`
          : 'Review and manage the items in your cart before checkout.'}
      </p>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <ShoppingBag size={56} className="text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Looks like you have not added anything to your cart yet. Browse our
            products and find something you like.
          </p>
          <Link href="/product" className="mt-6">
            <Button size="lg">
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: cart items */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {items.length} product{items.length === 1 ? '' : 's'}
              </p>
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                <Trash2 size={15} />
                Clear cart
              </button>
            </div>

            {items.map((item) => (
              <CartItemCard key={item.productId} item={item} />
            ))}
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-4">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">
                    Subtotal ({totalItems} item{totalItems === 1 ? '' : 's'})
                  </dt>
                  <dd className="font-medium text-gray-900">
                    ৳{originalSubtotal.toLocaleString()}
                  </dd>
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-gray-500">Total savings</dt>
                    <dd className="font-semibold text-green-600">
                      -৳{totalSavings.toLocaleString()}
                    </dd>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Shipping</dt>
                  <dd className="font-medium text-gray-900">Free</dd>
                </div>

                <div className="my-2 border-t border-gray-200" />

                <div className="flex items-center justify-between text-base">
                  <dt className="font-semibold text-gray-900">Total</dt>
                  <dd className="text-lg font-bold text-gray-900">
                    ৳{totalPrice.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <Link href="/checkout" className="mt-5 block">
                <Button fullWidth size="lg">
                  Proceed to Checkout
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>

              <Link
                href="/product"
                className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-900"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
