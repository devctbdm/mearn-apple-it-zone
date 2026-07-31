// src/components/store/layout/Header.tsx
'use client';

import { useCart } from '@/store';

export const Header: React.FC = () => {
  const { totalItems } = useCart();

  return (
    <header>
      <span>🛒 ({totalItems})</span>
    </header>
  );
};
