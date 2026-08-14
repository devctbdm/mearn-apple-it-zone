'use client';
import { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Bike,
  CreditCard,
  AlertTriangle,
  Bell,
  Info,
  LayoutGrid,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

/* ---------------------------------------------------------
   MOCK DATA — replace with calls to your Pathow API
   e.g. GET /api/notifications, PATCH /api/notifications/:id/read
--------------------------------------------------------- */
const TYPE_CONFIG = {
  new_order: { icon: Package, color: '#1D4ED8', bg: '#EAF1FF' },
  delivered: { icon: CheckCircle2, color: '#15803D', bg: '#E9F9EE' },
  failed: { icon: XCircle, color: '#B91C1C', bg: '#FDEAEA' },
  rider: { icon: Bike, color: '#C2410C', bg: '#FFEDE3' },
  payment: { icon: CreditCard, color: '#7C3AED', bg: '#F3ECFE' },
  alert: { icon: AlertTriangle, color: '#B45309', bg: '#FEF3E2' },
  system: { icon: Info, color: '#64748B', bg: '#F1F3F6' },
};

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'new_order',
    title: 'New order received',
    message: 'PTW-88223 placed by Rezaul Karim, Bashundhara R/A',
    time: '2 min ago',
    group: 'Today',
    read: false,
  },
  {
    id: '2',
    type: 'failed',
    title: 'Delivery failed',
    message: 'PTW-88218 could not be delivered — customer unreachable',
    time: '24 min ago',
    group: 'Today',
    read: false,
  },
  {
    id: '3',
    type: 'rider',
    title: 'Rider assigned',
    message: 'Rakib Hasan picked up order PTW-88213',
    time: '38 min ago',
    group: 'Today',
    read: false,
  },
  {
    id: '4',
    type: 'delivered',
    title: 'Order delivered',
    message: 'PTW-88215 delivered to Farhana Islam, Khilkhet',
    time: '1 hr ago',
    group: 'Today',
    read: true,
  },
  {
    id: '5',
    type: 'payment',
    title: 'COD payment collected',
    message: '৳2,100 collected for PTW-88215 by Imran Kabir',
    time: '1 hr ago',
    group: 'Today',
    read: true,
  },
  {
    id: '6',
    type: 'alert',
    title: 'Rider running late',
    message: 'PTW-88221 is 12 min past estimated delivery time',
    time: '2 hr ago',
    group: 'Today',
    read: false,
  },
  {
    id: '7',
    type: 'new_order',
    title: 'New order received',
    message: 'PTW-88222 placed by Habibur Rahman, Old Dhaka',
    time: '3 hr ago',
    group: 'Today',
    read: true,
  },
  {
    id: '8',
    type: 'system',
    title: 'Scheduled maintenance',
    message: 'Pathow API will undergo maintenance tonight 2–3 AM',
    time: '5 hr ago',
    group: 'Today',
    read: true,
  },
  {
    id: '9',
    type: 'delivered',
    title: 'Order delivered',
    message: 'PTW-88219 delivered to Rumana Akter, Agrabad',
    time: 'Yesterday, 6:40 PM',
    group: 'Earlier',
    read: true,
  },
  {
    id: '10',
    type: 'rider',
    title: 'New rider onboarded',
    message: 'Jasim Uddin joined your rider fleet in Khulna',
    time: 'Yesterday, 3:12 PM',
    group: 'Earlier',
    read: true,
  },
  {
    id: '11',
    type: 'failed',
    title: 'Delivery cancelled',
    message: 'PTW-88220 was cancelled by the customer',
    time: 'Yesterday, 11:05 AM',
    group: 'Earlier',
    read: true,
  },
  {
    id: '12',
    type: 'payment',
    title: 'Weekly payout processed',
    message: '৳48,200 transferred to your linked bank account',
    time: '2 days ago',
    group: 'Earlier',
    read: true,
  },
];

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  {
    key: 'orders',
    label: 'Orders',
    types: ['new_order', 'delivered', 'failed'],
  },
  { key: 'riders', label: 'Riders', types: ['rider'] },
  { key: 'system', label: 'System', types: ['system', 'alert', 'payment'] },
];

function NotificationItem({ n, onToggleRead, index }) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;
  return (
    <div
      className="group flex gap-3 px-4 py-3.5 rounded-2xl border cursor-pointer transition-colors animate-fadeUp"
      style={{
        borderColor: '#E7E9EE',
        background: n.read ? '#FFFFFF' : '#FFF9F5',
        animationDelay: `${index * 25}ms`,
      }}
      onClick={() => onToggleRead(n.id)}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.bg }}
      >
        <Icon size={16} style={{ color: cfg.color }} strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">{n.title}</div>
          {!n.read && (
            <span
              className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#C2410C' }}
            />
          )}
        </div>
        <div className="text-[13px] text-slate-500 mt-0.5 leading-snug">
          {n.message}
        </div>
        <div className="font-mono text-[11px] text-slate-400 mt-1.5">
          {n.time}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity self-start text-slate-300 hover:text-slate-500 flex-shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    newOrders: true,
    deliveryUpdates: true,
    riderUpdates: true,
    payments: true,
    systemAlerts: false,
    pushEnabled: true,
    emailEnabled: false,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    const tab = FILTER_TABS.find((t) => t.key === filter);
    return notifications.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return tab.types.includes(n.type);
    });
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const today = filtered.filter((n) => n.group === 'Today');
    const earlier = filtered.filter((n) => n.group === 'Earlier');
    return { Today: today, Earlier: earlier };
  }, [filtered]);

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', active: false },
    { icon: Package, label: 'Deliveries', active: false },
    { icon: Users, label: 'Riders', active: false },
    { icon: Bell, label: 'Notifications', active: true },
    { icon: BarChart3, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  const prefRows = [
    {
      key: 'newOrders',
      label: 'New orders',
      desc: 'When a customer places a new order',
    },
    {
      key: 'deliveryUpdates',
      label: 'Delivery updates',
      desc: 'Pickups, in-transit, delivered, failed',
    },
    {
      key: 'riderUpdates',
      label: 'Rider updates',
      desc: 'Assignments and rider status changes',
    },
    { key: 'payments', label: 'Payments', desc: 'COD collections and payouts' },
    {
      key: 'systemAlerts',
      label: 'System alerts',
      desc: 'Maintenance and account notices',
    },
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: '#F8F8F6' }}>
      <div className="flex">
        {/* Main */}
        <div className="flex-1 min-w-0">
          <main className="p-4 lg:p-8">
            {/* Page title */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden text-slate-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span
                        className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: '#C2410C' }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </h1>
                  <p className="text-[13px] text-slate-500">
                    Order, delivery and rider activity for your account
                  </p>
                </div>
              </div>
              <button
                onClick={markAllRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border bg-white text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                style={{ borderColor: '#E7E9EE' }}
              >
                <CheckCheck size={14} />
                Mark all as read
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
              {/* Notification list */}
              <div>
                {/* Filter tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
                  {FILTER_TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setFilter(t.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border"
                      style={
                        filter === t.key
                          ? {
                              background: '#C2410C',
                              color: '#FFFFFF',
                              borderColor: '#C2410C',
                            }
                          : {
                              background: '#FFFFFF',
                              color: '#64748B',
                              borderColor: '#E7E9EE',
                            }
                      }
                    >
                      {t.label}
                      {t.key === 'unread' &&
                        unreadCount > 0 &&
                        ` (${unreadCount})`}
                    </button>
                  ))}
                </div>

                <button
                  onClick={markAllRead}
                  className="sm:hidden mb-4 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border bg-white text-slate-600"
                  style={{ borderColor: '#E7E9EE' }}
                >
                  <CheckCheck size={14} />
                  Mark all as read
                </button>

                {['Today', 'Earlier'].map((group) =>
                  grouped[group].length > 0 ? (
                    <div key={group} className="mb-6">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                        {group}
                      </div>
                      <div className="space-y-2">
                        {grouped[group].map((n, i) => (
                          <NotificationItem
                            key={n.id}
                            n={n}
                            onToggleRead={toggleRead}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}

                {filtered.length === 0 && (
                  <div
                    className="py-16 text-center rounded-2xl border bg-white"
                    style={{ borderColor: '#E7E9EE' }}
                  >
                    <Bell size={22} className="mx-auto text-slate-300 mb-2" />
                    <div className="text-sm text-slate-400">
                      No notifications here.
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences panel */}
              <div
                className="rounded-2xl border bg-white p-5 lg:sticky lg:top-8"
                style={{ borderColor: '#E7E9EE' }}
              >
                <div className="font-display font-bold text-slate-900 text-sm mb-1">
                  Notification settings
                </div>
                <div className="text-[12px] text-slate-500 mb-4">
                  Choose what you want to be notified about
                </div>

                <div className="space-y-4 mb-5">
                  {prefRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">
                          {row.label}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {row.desc}
                        </div>
                      </div>
                      <Switch
                        checked={prefs[row.key]}
                        onCheckedChange={() =>
                          setPrefs((p) => ({ ...p, [row.key]: !p[row.key] }))
                        }
                        className="flex-shrink-0 data-[state=checked]:bg-[#C2410C]"
                      />
                    </div>
                  ))}
                </div>

                <div
                  className="border-t pt-4"
                  style={{ borderColor: '#EEF0F3' }}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Delivery method
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-slate-700">
                      Push notifications
                    </span>
                    <Switch
                      checked={prefs.pushEnabled}
                      onCheckedChange={() =>
                        setPrefs((p) => ({ ...p, pushEnabled: !p.pushEnabled }))
                      }
                      className="data-[state=checked]:bg-[#C2410C]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-700">
                      Email notifications
                    </span>
                    <Switch
                      checked={prefs.emailEnabled}
                      onCheckedChange={() =>
                        setPrefs((p) => ({
                          ...p,
                          emailEnabled: !p.emailEnabled,
                        }))
                      }
                      className="data-[state=checked]:bg-[#C2410C]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
