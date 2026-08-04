// src/app/(store)/checkout/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useAuth, useCart, useCheckout, useUI } from '@/store';
import {
  authApi,
  orderApi,
  paymentApi,
  paymentSettingsApi,
  promoApi,
  type ActivePaymentGateway,
  type SavedAddress,
} from '@/lib/api';
import { Button } from '@/components/button/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import RequireAuth from '@/components/store/layout/RequireAuth';

const DELIVERY_METHODS = [
  {
    value: 'standard',
    label: 'Standard Delivery',
    eta: '3–5 business days',
    cost: 0,
  },
  {
    value: 'express',
    label: 'Express Delivery',
    eta: '1–2 business days',
    cost: 100,
  },
] as const;

const GATEWAY_ICONS: Record<string, typeof CreditCard> = {
  sslcommerz: CreditCard,
  bkash: Smartphone,
};

type DeliveryValue = (typeof DELIVERY_METHODS)[number]['value'];

const CheckoutContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, totalItems, totalPrice, clearCart, fetchCart } = useCart();
  const { paymentMethod, setPaymentMethod, notes, setNotes } = useCheckout();
  const { showToast } = useUI();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed' | 'free_shipping';
    description?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryValue>('standard');
  const [agreed, setAgreed] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);

  const [gateways, setGateways] = useState<ActivePaymentGateway[]>([]);

  useEffect(() => {
    paymentSettingsApi
      .getActive()
      .then(({ data }) => {
        setGateways(data.gateways || []);
        if (data.gateways?.length) {
          setPaymentMethod(
            data.gateways[0].name.toLowerCase() as
              'sslcommerz' | 'cod' | 'bkash' | 'nagad'
          );
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCart().catch(() => {});
    let cancelled = false;
    setAddressesLoading(true);
    authApi
      .getAddresses()
      .then(({ data }) => {
        if (cancelled) return;
        setAddresses(data.addresses || []);
        const def =
          data.addresses.find((a) => a.isDefault) || data.addresses[0];
        if (def) setSelectedAddressId(def._id);
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load addresses', 'error');
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const selectedAddress = useMemo(
    () =>
      addresses.find((a) => a._id === selectedAddressId) ||
      addresses.find((a) => a.isDefault) ||
      addresses[0],
    [addresses, selectedAddressId]
  );

  const subtotal = totalPrice;
  const couponDiscount = appliedCoupon?.discount || 0;
  const deliveryCost =
    appliedCoupon?.type === 'free_shipping'
      ? 0
      : DELIVERY_METHODS.find((d) => d.value === deliveryMethod)?.cost || 0;
  const grandTotal = subtotal - couponDiscount + deliveryCost;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setOrderError('');
    try {
      const { data } = await promoApi.validate(code, subtotal);
      setAppliedCoupon({
        code: data.promo.code || code,
        discount: data.discount,
        type: data.promo.type || 'percentage',
        description: data.promo.description,
      });
      setCouponInput('');
      if (data.promo.type === 'free_shipping') {
        showToast('Coupon applied! Free shipping on this order', 'success');
      } else if (data.discount > 0) {
        showToast(
          `Coupon applied! You saved ৳${data.discount.toLocaleString()}`,
          'success'
        );
      } else {
        showToast(
          'Coupon applied but it offers no discount on your cart',
          'info'
        );
      }
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setOrderError('');
    if (!isAuthenticated || !user) return;
    if (items.length === 0) return;
    if (!selectedAddress) {
      setOrderError('Please select a shipping address.');
      return;
    }
    if (!agreed) {
      setOrderError(
        'Please read and agree to the Terms & Conditions, Privacy Policy and Refund & Return Policy.'
      );
      return;
    }

    setPlacing(true);
    try {
      const { data } = await orderApi.create({
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postcode: selectedAddress.postcode,
          country: selectedAddress.country,
        },
        paymentMethod: paymentMethod as string,
        note: notes,
        couponCode: appliedCoupon?.code,
      });

      // SSLCommerz online payment: redirect to the payment gateway page.
      if (paymentMethod === 'sslcommerz') {
        const customer = {
          name: selectedAddress.fullName || user.name,
          email: user.email,
          phone: selectedAddress.phone || user.phone,
          address: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postcode: selectedAddress.postcode,
        };
        try {
          const payRes = await paymentApi.initiate({
            orderId: data.order._id,
            amount: grandTotal,
            customer,
          });
          if (payRes.data.success && payRes.data.gatewayUrl) {
            await clearCart();
            setAppliedCoupon(null);
            window.location.href = payRes.data.gatewayUrl;
            return;
          }
          throw new Error(
            payRes.data.gatewayUrl
              ? 'Payment gateway could not be reached. Please try again.'
              : 'Payment initiation failed. Please try again.'
          );
        } catch (payErr: any) {
          setOrderError(
            payErr?.response?.data?.message ||
              'Your order was created, but the payment gateway could not be reached. Please try again or pay from your orders.'
          );
          return;
        }
      }

      await clearCart();
      setAppliedCoupon(null);
      setPlacedOrder(data.order._id);
      showToast('Order placed successfully!', 'success');
    } catch (e: any) {
      setOrderError(
        e?.response?.data?.message ||
          'Failed to place your order. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  // ---- Success screen ----
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 size={56} className="mx-auto text-green-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for shopping with Apple IT Zone. Your order
            <span className="mx-1 font-semibold text-gray-900">
              #{placedOrder}
            </span>
            has been received and is being processed.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/accounts">
              <Button fullWidth>View My Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Auth still loading ----
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // ---- Not logged in ----
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-sm text-gray-600">
            You need to be signed in to checkout. Your saved address and orders
            will be available in your account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button fullWidth>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" fullWidth>
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Checkout</h1>

      {/* Company notice */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Apple IT Zone</span> — if anything
          goes wrong with your order, we may cancel it at any time. You will be
          notified immediately and any payment will be refunded.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---------- Left: Address + Special requirements ---------- */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Shipping Address
              </h2>
            </div>

            {addressesLoading ? (
              <div className="mt-4 space-y-3">
                <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                <MapPin size={32} className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-700">
                  Please update your profile and fill up your address.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  After filling up the address, it will show automatically.
                </p>
                <Link href="/accounts" className="mt-4 inline-block">
                  <Button size="sm">Go to Profile</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => setSelectedAddressId(a._id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selectedAddress?._id === a._id
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {a.label || 'Address'}
                        </span>
                        {a.isDefault && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-0.5 text-sm text-gray-600">
                        <p className="font-medium text-gray-800">
                          {a.fullName}
                        </p>
                        <p>{a.phone}</p>
                        <p>{a.street}</p>
                        <p>
                          {a.city}, {a.state} {a.postcode}
                        </p>
                        <p>{a.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <Link
                  href="/accounts"
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Manage addresses
                </Link>
              </>
            )}
          </div>

          {/* Special requirements */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Special Requirements
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Any special request from the customer for this order.
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-3"
              placeholder="e.g. Deliver after 6 PM, gift wrapping, call before delivery..."
            />
          </div>
        </div>

        {/* ---------- Right: Order Summary ---------- */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-4">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            {/* Coupon */}
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-700">
                Coupon code
              </Label>
              {appliedCoupon ? (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      {appliedCoupon.code}
                    </p>
                    {appliedCoupon.description && (
                      <p className="text-xs text-green-600">
                        {appliedCoupon.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      showToast('Coupon removed', 'info');
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <XCircle size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            {/* Sub-total */}
            <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  Subtotal ({totalItems} item{totalItems === 1 ? '' : 's'})
                </span>
                <span className="font-medium text-gray-900">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="font-semibold text-green-600">
                    -৳{couponDiscount.toLocaleString()}
                  </span>
                </div>
              )}
              {appliedCoupon?.type === 'free_shipping' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Coupon ({appliedCoupon.code})
                  </span>
                  <span className="font-semibold text-green-600">
                    Free shipping
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Delivery fee</span>
                <span className="font-medium text-gray-900">
                  {deliveryCost === 0
                    ? 'Free'
                    : `৳${deliveryCost.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Delivery method */}
            <div className="mt-5 border-t border-gray-200 pt-4">
              <Label className="text-sm font-medium text-gray-700">
                Delivery method
              </Label>
              <div className="mt-2 space-y-2">
                {DELIVERY_METHODS.map((d) => {
                  const active = deliveryMethod === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDeliveryMethod(d.value)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Truck
                        size={18}
                        className={active ? 'text-blue-600' : 'text-gray-400'}
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-gray-900">
                          {d.label}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {d.eta}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {d.cost === 0 ? 'Free' : `৳${d.cost}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Terms */}
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={agreed}
                onCheckedChange={() => setAgreed(!agreed)}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-gray-600">
                I have read and agree to the{' '}
                <Link
                  href="/terms"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Terms and Conditions
                </Link>
                ,{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/refund"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Refund and Return Policy
                </Link>
                .
              </span>
            </label>

            {orderError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {orderError}
              </p>
            )}

            <Button
              fullWidth
              size="lg"
              className="mt-4"
              loading={placing}
              onClick={handlePlaceOrder}
              disabled={items.length === 0}
            >
              Confirm Order
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- Bottom: Payment + Delivery ---------- */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {gateways.map((p) => {
              const value = p.name.toLowerCase();
              const active = paymentMethod === value;
              const Icon = GATEWAY_ICONS[value] || Wallet;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      value as 'sslcommerz' | 'cod' | 'bkash' | 'nagad'
                    )
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? 'text-blue-600' : 'text-gray-400'}
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      {p.label}
                    </span>
                    {p.description && (
                      <span className="block text-xs text-gray-500">
                        {p.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {gateways.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                No payment methods are available right now.
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-gray-200 pt-4">
            <Label className="text-sm font-medium text-gray-700">
              Delivery method
            </Label>
            <p className="mt-1.5 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {
                  DELIVERY_METHODS.find((d) => d.value === deliveryMethod)
                    ?.label
                }
              </span>{' '}
              · {DELIVERY_METHODS.find((d) => d.value === deliveryMethod)?.eta}
              {' · '}
              {deliveryCost === 0
                ? 'Free'
                : `৳${deliveryCost.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* ---------- Bottom: Selected products ---------- */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900">
            Selected Products ({totalItems})
          </h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Your cart is empty.{' '}
              <Link
                href="/"
                className="font-medium text-blue-600 hover:underline"
              >
                Continue shopping
              </Link>
            </p>
          ) : (
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.image || '/placeholder-image.png'}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ৳{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}
