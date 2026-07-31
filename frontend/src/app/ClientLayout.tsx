// src/app/ClientLayout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'motion/react';

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <div key={pathname} className="min-h-screen">
        {children}
      </div>
    </AnimatePresence>
  );
}
