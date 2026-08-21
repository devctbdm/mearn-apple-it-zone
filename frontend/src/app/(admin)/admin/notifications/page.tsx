'use client';
import { useMemo, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Package,
  Truck,
  User,
  Megaphone,
  CreditCard,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

type NotificationCategory =
  'order' | 'delivery' | 'rider' | 'payment' | 'system';
type Filter = 'all' | 'unread' | 'orders';

interface Notification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  read: boolean;
  time: string;
}

const categoryIcon: Record<NotificationCategory, React.ElementType> = {
  order: Package,
  delivery: Truck,
  rider: User,
  payment: CreditCard,
  system: Megaphone,
};

const categoryColor: Record<NotificationCategory, string> = {
  order: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  delivery:
    'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  rider:
    'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  payment:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  system: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const initialNotifications: Notification[] = [
  {
    id: 'ntf-1',
    title: 'New order received',
    description: 'Order #ORD-1025 has been placed by Rahul Ahmed for ৳84,999.',
    category: 'order',
    read: false,
    time: '2 min ago',
  },
  {
    id: 'ntf-2',
    title: 'Rider assigned',
    description: 'Pathao rider Karim H. is assigned to order #ORD-1020.',
    category: 'rider',
    read: false,
    time: '15 min ago',
  },
  {
    id: 'ntf-3',
    title: 'Order delivered',
    description: 'Order #ORD-1015 has been delivered successfully.',
    category: 'delivery',
    read: false,
    time: '1 hour ago',
  },
  {
    id: 'ntf-4',
    title: 'Payment confirmed',
    description: 'bKash payment of ৳32,500 for order #ORD-1018 is confirmed.',
    category: 'payment',
    read: true,
    time: '3 hours ago',
  },
  {
    id: 'ntf-5',
    title: 'Order cancelled',
    description: 'Order #ORD-1012 was cancelled by the customer.',
    category: 'order',
    read: true,
    time: '5 hours ago',
  },
  {
    id: 'ntf-6',
    title: 'Rider reached pickup',
    description:
      'Rider Hasan M. has reached the pickup location for order #ORD-1020.',
    category: 'rider',
    read: true,
    time: 'Yesterday',
  },
  {
    id: 'ntf-7',
    title: 'Low stock alert',
    description:
      'iPhone 15 Pro Max 256GB is running low in inventory (4 left).',
    category: 'system',
    read: true,
    time: 'Yesterday',
  },
  {
    id: 'ntf-8',
    title: 'Delivery failed',
    description: 'Order #ORD-1008 delivery failed. Customer not available.',
    category: 'delivery',
    read: true,
    time: '2 days ago',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<Filter>('all');

  const [newOrdersEnabled, setNewOrdersEnabled] = useState(true);
  const [advancePaymentEnabled, setAdvancePaymentEnabled] = useState(true);
  const [deliveryUpdatesEnabled, setDeliveryUpdatesEnabled] = useState(true);
  const [riderUpdatesEnabled, setRiderUpdatesEnabled] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );
  const orderCount = useMemo(
    () => notifications.filter((n) => n.category === 'order').length,
    [notifications]
  );

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.read;
      if (filter === 'orders') return n.category === 'order';
      return true;
    });
  }, [notifications, filter]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay updated with orders, deliveries and rider activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: notifications list */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-col gap-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Notifications</CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/10"
                      >
                        {unreadCount}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order, delivery and rider activity for your account.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              </div>

              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as Filter)}
                className="w-full"
              >
                <TabsList className="w-full justify-start sm:w-auto">
                  <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="flex-1 sm:flex-initial"
                  >
                    Unread ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="flex-1 sm:flex-initial"
                  >
                    Orders ({orderCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="pt-0">
              <ScrollArea className="h-130 pr-3">
                {filtered.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
                    <Bell className="mb-3 h-10 w-10 opacity-20" />
                    <p>No notifications found.</p>
                    <p className="text-sm">You are all caught up.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((n) => {
                      const Icon = categoryIcon[n.category];
                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              markAsRead(n.id);
                          }}
                          className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-accent/50 ${
                            n.read ? 'opacity-80' : 'bg-accent/30'
                          }`}
                        >
                          {!n.read && (
                            <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary" />
                          )}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${categoryColor[n.category]}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium leading-tight">
                                {n.title}
                              </p>
                              <span className="text-xs whitespace-nowrap text-muted-foreground">
                                {n.time}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {n.description}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {n.category}
                              </Badge>
                              {!n.read && (
                                <span className="text-xs font-medium text-primary">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right column: settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  Notification settings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="new-orders" className="font-medium">
                    New orders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when a new order is placed.
                  </p>
                </div>
                <Switch
                  id="new-orders"
                  checked={newOrdersEnabled}
                  onCheckedChange={setNewOrdersEnabled}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="advance-payment" className="font-medium">
                    Advance payment notification
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Alerts for partial and full advance payments.
                  </p>
                </div>
                <Switch
                  id="advance-payment"
                  checked={advancePaymentEnabled}
                  onCheckedChange={setAdvancePaymentEnabled}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions" className="font-medium">
                    Promotions & system
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Low stock and platform announcements.
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={promotionsEnabled}
                  onCheckedChange={setPromotionsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Quiet hours</p>
                  <p className="text-sm text-muted-foreground">
                    Disable non-critical alerts between 10:00 PM and 7:00 AM.
                  </p>
                  <Button
                    variant="link"
                    className="h-auto px-0 py-1 text-sm"
                    onClick={() =>
                      toast.info('Quiet hours settings coming soon')
                    }
                  >
                    Configure schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
