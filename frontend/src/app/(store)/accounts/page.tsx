'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Package,
  Heart,
  MapPin,
  KeyRound,
  Pencil,
  LogOut,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authApi, orderApi, SavedAddress } from '@/lib/api';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
type Order = {
  id: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
};

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  isDefault: boolean;
};

type WishItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const mapBackendAddress = (a: SavedAddress): Address => ({
  id: a._id,
  label: a.label,
  fullName: a.fullName,
  phone: a.phone,
  line1: a.street,
  city: a.city,
  region: a.state,
  postal: a.postcode,
  country: a.country,
  isDefault: a.isDefault,
});

const statusMeta: Record<
  OrderStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800',
    Icon: Truck,
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-indigo-100 text-indigo-800',
    Icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-800',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-800',
    Icon: XCircle,
  },
};

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name required').max(60),
  phone: z.string().trim().min(6, 'Phone required').max(30),
});

const passwordSchema = z
  .object({
    current: z.string().min(6, 'Enter current password'),
    next: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(8, 'At least 8 characters'),
  })
  .refine((v) => v.next === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

const addressSchema = z.object({
  label: z.string().trim().min(1).max(30),
  fullName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(30),
  line1: z.string().trim().min(1).max(160),
  city: z.string().trim().min(1).max(80),
  region: z.string().trim().min(1).max(80),
  postal: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(80),
});

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || 'Guest',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist] = useState<WishItem[]>([]);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [addressDialog, setAddressDialog] = useState<{
    open: boolean;
    editing?: Address;
  }>({ open: false });
  const [deleteAddress, setDeleteAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  useEffect(() => {
    authApi
      .getAddresses()
      .then(({ data }) => {
        if (data.success) setAddresses(data.addresses.map(mapBackendAddress));
      })
      .catch(() => toast.error('Failed to load addresses'));
  }, []);

  useEffect(() => {
    orderApi
      .getMyOrders()
      .then(({ data }) => {
        if (data.success) {
          setOrders(
            data.orders.map((o) => ({
              id: o._id,
              date: o.createdAt,
              items: o.items.reduce((a, i) => a + i.quantity, 0),
              total: o.totalAmount,
              status: o.orderStatus,
            }))
          );
        }
      })
      .catch(() => toast.error('Failed to load orders'));
  }, []);

  const stats = useMemo(() => {
    const totalSpent = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((a, o) => a + o.total, 0);
    return {
      orders: orders.length,
      pending: orders.filter(
        (o) => o.status === 'processing' || o.status === 'shipped'
      ).length,
      wishlist: wishlist.length,
      addresses: addresses.length,
      totalSpent,
    };
  }, [orders, addresses, wishlist]);

  const setDefaultAddress = async (id: string) => {
    try {
      const { data } = await authApi.setDefaultAddress(id);
      if (data.success) {
        setAddresses(data.addresses.map(mapBackendAddress));
        toast.success('Default address updated');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update address');
    }
  };

  const saveAddress = async (
    values: z.infer<typeof addressSchema>,
    id?: string
  ) => {
    const payload = {
      label: values.label,
      fullName: values.fullName,
      phone: values.phone,
      street: values.line1,
      city: values.city,
      state: values.region,
      postcode: values.postal,
      country: values.country,
    };
    try {
      const { data } = id
        ? await authApi.updateAddress(id, payload)
        : await authApi.addAddress(payload);
      if (data.success) {
        setAddresses(data.addresses.map(mapBackendAddress));
        toast.success(id ? 'Address updated' : 'Address added');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const { data } = await authApi.deleteAddress(id);
      if (data.success) {
        setAddresses(data.addresses.map(mapBackendAddress));
        toast.success('Address removed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove address');
    }
  };

  const removeWish = (id: string) => {
    toast.success('Removed from wishlist');
  };

  const saveProfile = async (v: z.infer<typeof profileSchema>) => {
    try {
      await authApi.updateProfile({ name: v.name, phone: v.phone });
      setProfile({ ...profile, name: v.name, phone: v.phone });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Profile summary */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {profile.name.trim().charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <p className="text-sm text-muted-foreground">{profile.phone}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setEditProfileOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit profile
              </Button>
              <Button variant="outline" onClick={() => setChangePassOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" /> Change password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Orders"
            value={stats.orders}
            Icon={Package}
            tone="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="In Progress"
            value={stats.pending}
            Icon={Truck}
            tone="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Wishlist Items"
            value={stats.wishlist}
            Icon={Heart}
            tone="bg-rose-50 text-rose-600"
          />
          <StatCard
            label="Saved Addresses"
            value={stats.addresses}
            Icon={MapPin}
            tone="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          {/* Orders */}
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent orders</CardTitle>
                <CardDescription>
                  Track your recent purchases and their status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {orders.length === 0 && (
                  <EmptyState
                    Icon={ShoppingBag}
                    title="No orders yet"
                    hint="Your orders will appear here."
                  />
                )}
                {orders.map((o) => {
                  const meta = statusMeta[o.status];
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={o.id}
                      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{o.id}</p>
                            <Badge
                              variant="secondary"
                              className={meta.className}
                            >
                              <Icon className="mr-1 h-3 w-3" />
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.date).toLocaleDateString()} · {o.items}{' '}
                            item{o.items > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="font-semibold">
                          ${o.total.toLocaleString()}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.message(`Viewing ${o.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My wishlist</CardTitle>
                <CardDescription>Items you saved for later.</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlist.length === 0 ? (
                  <EmptyState
                    Icon={Heart}
                    title="Wishlist is empty"
                    hint="Save products to view them here."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((w) => (
                      <div
                        key={w.id}
                        className="overflow-hidden rounded-lg border bg-card"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-muted">
                          <img
                            src={w.image}
                            alt={w.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{w.name}</p>
                            <Badge
                              variant={w.inStock ? 'secondary' : 'destructive'}
                            >
                              {w.inStock ? 'In stock' : 'Out'}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${w.price.toLocaleString()}
                          </p>
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              disabled={!w.inStock}
                            >
                              Add to cart
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeWish(w.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved addresses</CardTitle>
                  <CardDescription>
                    Manage your shipping and billing addresses.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setAddressDialog({ open: true })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <EmptyState
                    Icon={MapPin}
                    title="No addresses saved"
                    hint="Add an address for faster checkout."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <div key={a.id} className="rounded-lg border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{a.label}</p>
                            {a.isDefault && <Badge>Default</Badge>}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                setAddressDialog({ open: true, editing: a })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteAddress(a)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {a.fullName}
                          </p>
                          <p>{a.phone}</p>
                          <p>{a.line1}</p>
                          <p>
                            {a.city}, {a.region} {a.postal}
                          </p>
                          <p>{a.country}</p>
                        </div>
                        {!a.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() => setDefaultAddress(a.id)}
                          >
                            Set as default
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal information</CardTitle>
                  <CardDescription>Your account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Row label="Name" value={profile.name} />
                  <Row label="Email" value={profile.email} />
                  <Row label="Phone" value={profile.phone} />
                  <Button
                    className="mt-2"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Keep your account safe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Row label="Password" value="••••••••••" />
                  <Row label="Two-factor auth" value="Disabled" />
                  <Button
                    variant="outline"
                    onClick={() => setChangePassOpen(true)}
                  >
                    <KeyRound className="mr-2 h-4 w-4" /> Change password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit profile dialog */}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        initial={{ name: profile.name, phone: profile.phone }}
        onSave={saveProfile}
      />

      {/* Change password dialog */}
      <ChangePasswordDialog
        open={changePassOpen}
        onOpenChange={setChangePassOpen}
      />

      {/* Address dialog */}
      <AddressDialog
        state={addressDialog}
        onOpenChange={(open) =>
          setAddressDialog({
            open,
            editing: open ? addressDialog.editing : undefined,
          })
        }
        onSave={saveAddress}
      />

      {/* Delete address */}
      <AlertDialog
        open={!!deleteAddress}
        onOpenChange={(o) => !o && setDeleteAddress(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteAddress?.label}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAddress) removeAddress(deleteAddress.id);
                setDeleteAddress(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: typeof Package;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyState({
  Icon,
  title,
  hint,
}: {
  Icon: typeof Package;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: z.infer<typeof profileSchema>;
  onSave: (v: z.infer<typeof profileSchema>) => void;
}) {
  const { user } = useAuth();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof initial, string>>
  >({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof typeof initial, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof typeof initial;
        if (k && !fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }
    await onSave(parsed.data);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setValues(initial);
          setErrors({});
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your personal information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input
              value={values.phone}
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof values, string>>
  >({});
  const [show, setShow] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof typeof values, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof typeof values;
        if (k && !fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }
    try {
      await authApi.changePassword({
        currentPassword: values.current,
        newPassword: values.next,
      });
      toast.success('Password changed');
      onOpenChange(false);
      setValues({ current: '', next: '', confirm: '' });
      setErrors({});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Choose a strong password (min 8 characters).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {(['current', 'next', 'confirm'] as const).map((k) => (
            <div key={k} className="space-y-1">
              <Label>
                {k === 'current'
                  ? 'Current password'
                  : k === 'next'
                    ? 'New password'
                    : 'Confirm new password'}
              </Label>
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  value={values[k]}
                  onChange={(e) =>
                    setValues({ ...values, [k]: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={show ? 'Hide' : 'Show'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors[k] && (
                <p className="text-xs text-destructive">{errors[k]}</p>
              )}
            </div>
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddressDialog({
  state,
  onOpenChange,
  onSave,
}: {
  state: { open: boolean; editing?: Address };
  onOpenChange: (o: boolean) => void;
  onSave: (v: z.infer<typeof addressSchema>, id?: string) => void;
}) {
  const empty = {
    label: '',
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    region: '',
    postal: '',
    country: '',
  };
  const [values, setValues] = useState(state.editing ?? empty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof empty, string>>
  >({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = addressSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof typeof empty, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof typeof empty;
        if (k && !fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }
    onSave(parsed.data, state.editing?.id);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={state.open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setValues(state.editing ?? empty);
          setErrors({});
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {state.editing ? 'Edit address' : 'Add address'}
          </DialogTitle>
          <DialogDescription>Fill in the delivery details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Label"
            v={values.label}
            e={errors.label}
            onChange={(v) => setValues({ ...values, label: v })}
            placeholder="Home, Office..."
          />
          <Field
            label="Full name"
            v={values.fullName}
            e={errors.fullName}
            onChange={(v) => setValues({ ...values, fullName: v })}
          />
          <Field
            label="Phone"
            v={values.phone}
            e={errors.phone}
            onChange={(v) => setValues({ ...values, phone: v })}
          />
          <Field
            label="Country"
            v={values.country}
            e={errors.country}
            onChange={(v) => setValues({ ...values, country: v })}
          />
          <div className="sm:col-span-2">
            <Label className="mb-1 block">Street address</Label>
            <Textarea
              value={values.line1}
              onChange={(e) => setValues({ ...values, line1: e.target.value })}
              rows={2}
            />
            {errors.line1 && (
              <p className="text-xs text-destructive">{errors.line1}</p>
            )}
          </div>
          <Field
            label="City"
            v={values.city}
            e={errors.city}
            onChange={(v) => setValues({ ...values, city: v })}
          />
          <Field
            label="State/Region"
            v={values.region}
            e={errors.region}
            onChange={(v) => setValues({ ...values, region: v })}
          />
          <Field
            label="Postal code"
            v={values.postal}
            e={errors.postal}
            onChange={(v) => setValues({ ...values, postal: v })}
          />
          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {state.editing ? 'Save changes' : 'Add address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  v,
  e,
  onChange,
  placeholder,
}: {
  label: string;
  v: string;
  e?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        value={v}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder={placeholder}
      />
      {e && <p className="text-xs text-destructive">{e}</p>}
    </div>
  );
}
