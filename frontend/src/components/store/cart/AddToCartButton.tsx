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
    await addItem({
      productId: product._id,
      name: product.name,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
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
      size="lg"
      disabled={disabled}
    >
      Add to Cart
    </Button>
  );
};
