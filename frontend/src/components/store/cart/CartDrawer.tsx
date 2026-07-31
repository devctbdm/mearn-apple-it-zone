// src/components/store/cart/CartDrawer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart, useUI } from '@/store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const CartDrawer = () => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity } =
    useCart();
  const { isCartDrawerOpen, toggleCartDrawer } = useUI();

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={() => toggleCartDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>
            Your Cart ({totalItems} item{totalItems === 1 ? '' : 's'})
          </SheetTitle>
          <SheetDescription>
            Review and manage the items in your shopping cart.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag size={44} className="text-muted-foreground/40" />
              <p className="mt-4 font-medium text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add some products to get started.
              </p>
              <Link href="/" onClick={toggleCartDrawer} className="mt-5">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image || '/placeholder-image.png'}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-green-700">
                      ৳{(item.price * item.quantity).toLocaleString()}
                      {item.quantity > 1 && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (৳{item.price.toLocaleString()} × {item.quantity})
                        </span>
                      )}
                    </p>
                    {item.promoDiscount > 0 && (
                      <p className="mt-0.5 text-xs font-medium text-green-700">
                        You save ৳
                        {(item.promoDiscount * item.quantity).toLocaleString()}
                        {item.quantity > 1 && (
                          <span className="text-muted-foreground">
                            {' '}
                            (৳{item.promoDiscount.toLocaleString()}/unit)
                          </span>
                        )}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                ৳{totalPrice.toLocaleString()}
              </span>
            </div>
            <Link
              href="/checkout/cart"
              onClick={toggleCartDrawer}
              className="w-full"
            >
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              Shipping and promo codes are applied at checkout.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
