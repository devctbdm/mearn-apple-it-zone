'use client';

import { motion } from 'motion/react';
import {
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const order = {
  id: 'ORD-2459',
  amount: 125600,
  method: 'SSLCommerz',
  reason: 'Payment was cancelled by user',
  date: '17 Aug 2026, 9:31 PM',
};

const ringVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 14,
      delay: 0.1,
    },
  },
};

const crossVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 16,
        delay: 0.35,
        duration: 0.6,
      },
      opacity: { duration: 0.1 },
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 14 },
  },
};

function FloatingCrosses() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const pieces = Array.from({ length: 18 });
  const colors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-stone-400',
  ];

  const height = typeof window !== 'undefined' ? window.innerHeight : 800;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 1.8 + Math.random() * 1.5;
        const size = 6 + Math.random() * 8;
        const rotation = -180 + Math.random() * 360;
        const drift = -40 + Math.random() * 80;

        return (
          <motion.div
            key={i}
            className={`absolute top-0 ${colors[i % colors.length]}`}
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              clipPath:
                'polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)',
            }}
            initial={{ y: -30, opacity: 0, rotate: 0, x: 0 }}
            animate={{
              y: [0, height + 80],
              opacity: [0, 1, 1, 0],
              rotate: [0, rotation, rotation * 1.5],
              x: [0, drift, drift * 0.5],
            }}
            transition={{
              duration,
              delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

export default function PaymentCancellationPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <FloatingCrosses />

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/5 blur-3xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <Card className="border border-border/60 shadow-2xl shadow-rose-500/5">
          <CardContent className="flex flex-col items-center px-8 py-12 text-center">
            <div className="relative mb-8">
              <motion.div
                variants={ringVariants}
                className="flex items-center justify-center rounded-full bg-rose-500/10 p-5"
              >
                <svg
                  className="size-20 text-rose-500"
                  viewBox="0 0 52 52"
                  fill="none"
                >
                  <motion.circle
                    cx="26"
                    cy="26"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  />
                  <motion.path
                    d="M18 18 L34 34 M34 18 L18 34"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={crossVariants}
                  />
                </svg>
              </motion.div>

              <motion.div
                className="absolute -inset-3 rounded-full border border-rose-500/20"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 0], scale: [0.7, 1.15, 1.25] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute -inset-6 rounded-full border border-rose-500/10"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.7, 1.2, 1.35] }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.15 }}
              />
            </div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl font-semibold tracking-tight"
            >
              Payment Cancelled
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-3 max-w-xs text-sm text-muted-foreground"
            >
              Your payment was not completed. No amount has been charged. You
              can retry the payment or continue browsing.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 w-full space-y-3 rounded-xl bg-muted/40 p-4 text-left text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order number</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  ৳{order.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment method</span>
                <span className="font-medium">{order.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{order.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium text-rose-600">
                  {order.reason}
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 grid w-full gap-3 sm:grid-cols-2"
            >
              <Button className="w-full bg-rose-600 hover:bg-rose-700">
                <Link href="/offers" className="flex items-center gap-2">
                  <RotateCcw className="size-4" />
                  Retry payment
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Link href="/offers" className="flex items-center gap-2">
                  <ShoppingBag className="size-4" />
                  Continue shopping
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex w-full items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left"
            >
              <HelpCircle className="shrink-0 size-5 text-amber-600" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Need help?</p>
                <p>Contact our support team if you were charged by mistake.</p>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-center gap-4 text-center text-xs text-muted-foreground"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1.5 p-0 text-xs"
          >
            <Link href="/account" className="flex items-center gap-2">
              <MessageCircle className="size-3.5" />
              Contact support
            </Link>
          </Button>
          <span className="text-border">|</span>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
            <Link href="/account" className="flex items-center gap-2">
              View your account
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
