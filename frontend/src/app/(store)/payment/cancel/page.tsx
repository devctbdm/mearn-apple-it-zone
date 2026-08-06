'use client';

import { Suspense } from 'react';
import {
  PaymentResult,
  PaymentResultLoading,
} from '@/components/store/payment/PaymentResult';

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<PaymentResultLoading />}>
      <PaymentResult kind="cancel" />
    </Suspense>
  );
}
