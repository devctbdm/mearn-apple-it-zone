// src/components/store/compare/CompareDialog.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Scale, X } from 'lucide-react';
import { useCompare } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MAX_COMPARE } from '@/store/slices/compare.slice';

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompareDialog = ({
  open,
  onOpenChange,
}: CompareDialogProps) => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Compare Products ({compareItems.length}/{MAX_COMPARE})
          </DialogTitle>
          <DialogDescription>
            Add up to {MAX_COMPARE} products to view a side-by-side
            specification comparison.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto">
          {compareItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Scale size={44} className="text-muted-foreground/40" />
              <p className="mt-4 text-sm font-medium text-foreground">
                No products to compare yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the Compare button on any product card to add items here.
              </p>
            </div>
          ) : (
            compareItems.map((item) => {
              const price =
                item.discountPrice > 0 && item.discountPrice < item.price
                  ? item.discountPrice
                  : item.price;
              return (
                <div
                  key={item._id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image || '/placeholder-image.png'}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="line-clamp-1 text-sm font-medium text-foreground transition hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-semibold text-green-700">
                      ৳{price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCompare(item._id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${item.name} from comparison`}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          {compareItems.length > 0 && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={clearCompare}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
              <Link
                href="/product/compare"
                onClick={() => onOpenChange(false)}
                className="sm:flex-1"
              >
                <Button className="w-full" size="lg">
                  View Comparison
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </Link>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompareDialog;
