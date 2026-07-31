// src/components/store/cart/CartItem.tsx
'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/store/types';
import { useCart } from '@/store';

interface Props {
  item: CartItem;
}

export const CartItemCard = ({ item }: Props) => {
  const { removeItem, updateQuantity } = useCart();
  const lineTotal = item.price * item.quantity;
  const savings = item.promoDiscount * item.quantity;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={item.image || '/placeholder-image.png'}
            alt={item.name}
            fill
            className="object-contain"
            sizes="96px"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-2 text-sm font-medium text-gray-900 md:text-base">
              {item.name}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              aria-label={`Remove ${item.name} from cart`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Unit price: ৳{item.price.toLocaleString()}
            {item.promoDiscount > 0 && (
              <span className="ml-1 font-medium text-green-600">
                (Save ৳{item.promoDiscount.toLocaleString()})
              </span>
            )}
          </p>

          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-gray-900"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="text-right">
              <p className="text-base font-bold text-gray-900">
                ৳{lineTotal.toLocaleString()}
              </p>
              {savings > 0 && (
                <p className="text-xs font-medium text-green-600">
                  You save ৳{savings.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
