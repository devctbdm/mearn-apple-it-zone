'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Ban, Loader2 } from 'lucide-react';
import { paymentApi } from '@/lib/api';

const STYLES = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    border: 'border-green-200',
    bg: 'bg-green-50',
    title: 'Payment Successful',
    message:
      'Your payment has been completed and your order is now being processed.',
  },
  fail: {
    icon: XCircle,
    iconColor: 'text-red-600',
    border: 'border-red-200',
    bg: 'bg-red-50',
    title: 'Payment Failed',
    message:
      'We could not process your payment. Please try again or choose another payment method.',
  },
  cancel: {
    icon: Ban,
    iconColor: 'text-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    title: 'Payment Cancelled',
    message: 'Your payment was cancelled. No amount has been charged.',
  },
} as const;

export function PaymentResult({ kind }: { kind: keyof typeof STYLES }) {
  const params = useSearchParams();
  const tranId = params.get('tran_id') || '';
  const [validating, setValidating] = useState(false);
  const style = STYLES[kind];
  const Icon = style.icon;

  useEffect(() => {
    if (!tranId) return;
    setValidating(true);
    paymentApi
      .validate({
        tran_id: tranId,
        val_id: params.get('val_id') || undefined,
        status: params.get('status') || undefined,
        amount: params.get('amount') ? Number(params.get('amount')) : undefined,
        card_type: params.get('card_type') || undefined,
      })
      .catch(() => {})
      .finally(() => setValidating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tranId]);

  if (validating) {
    return <PaymentResultLoading />;
  }

  return (
    <div className="min-h-[80vh] mx-auto max-w-7xl px-4 py-10 flex items-center justify-center">
      <div
        className={`mx-auto max-w-xl rounded-2xl border ${style.border} ${style.bg} p-8 text-center`}
      >
        <Icon size={56} className={`mx-auto ${style.iconColor}`} />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{style.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{style.message}</p>

        {tranId && (
          <div className="mt-4 rounded-lg bg-white px-4 py-2 text-sm text-gray-500">
            Transaction ID: <span className="font-medium">{tranId}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/accounts">
            <span className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto">
              View My Orders
            </span>
          </Link>
          <Link href="/">
            <span className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto">
              Continue Shopping
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentResultLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Checking payment status...
      </div>
    </div>
  );
}
