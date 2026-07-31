'use client';

import { useCart } from '@/store';
import { Product } from '@/types/product';
import { Button } from '@/components/button/Button';

interface Props {
  product: Product;
  quantity?: number;
  disabled?: boolean;
}

export const AddToCartButton: React.FC<Props> = ({
  product,
  quantity = 1,
  disabled = false,
}) => {
  const { addItem, isLoading } = useCart();

  const handleAdd = async () => {
    const hasPromo =
      product.discountPrice > 0 && product.discountPrice < product.price;
    await addItem({
      productId: product._id,
      name: product.name,
      price: hasPromo ? product.discountPrice : product.price,
      promoDiscount: hasPromo ? product.price - product.discountPrice : 0,
      image: product.images[0],
      stock: product.stock,
      quantity,
    });
  };

  return (
    <Button
      onClick={handleAdd}
      loading={isLoading}
      fullWidth
      size="sm"
      disabled={disabled}
    >
      Add to Cart
    </Button>
  );
};
