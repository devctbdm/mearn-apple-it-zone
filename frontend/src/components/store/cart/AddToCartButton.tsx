'use client';

import { useCart } from '@/store';
import { Product } from '@/types/product';
import { Button } from '@/components/button/Button';

interface Props {
  product: Product;
}

export const AddToCartButton: React.FC<Props> = ({ product }) => {
  const { addItem, isLoading } = useCart();

  const handleAdd = async () => {
    await addItem({
      productId: product._id,
      name: product.name,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images[0],
      stock: product.stock,
    });
  };

  return (
    <Button onClick={handleAdd} loading={isLoading}>
      Add to Cart
    </Button>
  );
};
