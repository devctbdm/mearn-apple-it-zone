'use client';

import { Suspense } from 'react';
import {
  PaymentResult,
  PaymentResultLoading,
} from '@/components/store/payment/PaymentResult';

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<PaymentResultLoading />}>
      <PaymentResult kind="fail" />
    </Suspense>
  );
}
