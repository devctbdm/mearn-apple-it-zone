'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  Clock,
  ChevronRight,
  X,
  ArrowUpRight,
  Bike,
  CircleDot,
  MoreVertical,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { toast } from 'sonner';
import {
  deliveryApi,
  type Delivery,
  type DeliveryStatus,
  type PathaoLocation,
} from '@/lib/api';

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; icon: any }
> = {
  pending: { label: 'Pending', color: '#B45309', bg: '#FEF3E2', icon: Clock },
  picked_up: {
    label: 'Picked Up',
    color: '#1D4ED8',
    bg: '#EAF1FF',
    icon: Package,
  },
  in_transit: {
    label: 'In Transit',
    color: '#C2410C',
    bg: '#FFEDE3',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: '#15803D',
    bg: '#E9F9EE',
    icon: CheckCircle2,
  },
  failed: { label: 'Failed', color: '#B91C1C', bg: '#FDEAEA', icon: XCircle },
  cancelled: {
    label: 'Cancelled',
    color: '#64748B',
    bg: '#F1F3F6',
    icon: XCircle,
  },
};

const STATUS_TABS: ('all' | DeliveryStatus)[] = [
  'all',
  'pending',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
];

function etaFor(status: DeliveryStatus) {
  if (status === 'delivered') return 'Delivered';
  if (status === 'in_transit') return 'On way';
  if (status === 'picked_up') return 'Picked up';
  return '—';
}

function StatusPill({ status }: { status: DeliveryStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  index,
}: {
  label: string;
  value: number;
  delta?: string;
  icon: any;
  accent: string;
  index: number;
}) {
  return (
    <div
      className="animate-fadeUp relative flex-1 min-w-37.5 rounded-2xl p-4 border bg-white"
      style={{ borderColor: '#E7E9EE', animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <Icon size={16} style={{ color: accent }} strokeWidth={2.5} />
        </div>
        {delta && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight size={12} />
            {delta}
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </div>
      <div className="text-[13px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Timeline({ delivery }: { delivery: Delivery }) {
  const entries = delivery.history?.length
    ? delivery.history
    : [
        {
          status: delivery.status,
          note: 'Created',
          timestamp: delivery.createdAt,
        },
      ];
  return (
    <div className="space-y-3">
      {entries.map((t, i) => (
        <div key={i} className="flex items-center gap-3">
          <CircleDot
            size={14}
            className={
              i === entries.length - 1 ? 'text-orange-500' : 'text-slate-300'
            }
          />
          <div
            className="flex-1 text-sm"
            style={{ color: t.status ? '#1E293B' : '#A3AAB8' }}
          >
            {STATUS_CONFIG[t.status as DeliveryStatus]?.label ||
              t.status ||
              'Update'}
            {t.note ? (
              <span className="text-slate-400"> — {t.note}</span>
            ) : null}
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            {t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function DeliveryDrawer({
  delivery,
  onClose,
  onTrack,
  onStatusChange,
  onPushDraft,
}: {
  delivery: Delivery | null;
  onClose: () => void;
  onTrack: (d: Delivery) => void;
  onStatusChange: (id: string, status: DeliveryStatus) => void;
  onPushDraft: (
    id: string,
    payload: {
      storeId: number;
      cityId: number;
      zoneId: number;
      areaId: number;
      cityName?: string;
      zoneName?: string;
      areaName?: string;
    }
  ) => Promise<void>;
}) {
  const [localStatus, setLocalStatus] = useState<DeliveryStatus>('pending');
  const [showPush, setShowPush] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [stores, setStores] = useState<PathaoLocation[]>([]);
  const [cities, setCities] = useState<PathaoLocation[]>([]);
  const [zones, setZones] = useState<PathaoLocation[]>([]);
  const [areas, setAreas] = useState<PathaoLocation[]>([]);
  const [sel, setSel] = useState<{
    storeId?: number;
    cityId?: number;
    zoneId?: number;
    areaId?: number;
  }>({});

  useEffect(() => {
    if (delivery) setLocalStatus(delivery.status);
  }, [delivery]);

  useEffect(() => {
    if (showPush) {
      deliveryApi
        .stores()
        .then((r) => setStores(r.data.stores || []))
        .catch(() => {});
      deliveryApi
        .cities()
        .then((r) => setCities(r.data.cities || []))
        .catch(() => {});
    }
  }, [showPush]);

  useEffect(() => {
    if (sel.cityId != null) {
      deliveryApi
        .zones(sel.cityId)
        .then((r) => setZones(r.data.cities || []))
        .catch(() => setZones([]));
    } else {
      setZones([]);
      setAreas([]);
    }
    setSel((s) => ({ ...s, zoneId: undefined, areaId: undefined }));
  }, [sel.cityId]);

  useEffect(() => {
    if (sel.zoneId != null) {
      deliveryApi
        .areas(sel.zoneId)
        .then((r) => setAreas(r.data.areas || []))
        .catch(() => setAreas([]));
    } else {
      setAreas([]);
    }
    setSel((s) => ({ ...s, areaId: undefined }));
  }, [sel.zoneId]);

  if (!delivery) return null;
  const cfg = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.pending;
  const isDraft = !delivery.consignmentId;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto animate-slideIn border-l bg-white"
        style={{ borderColor: '#E7E9EE' }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-white"
          style={{ borderColor: '#E7E9EE' }}
        >
          <div>
            <div className="font-mono text-xs text-slate-400 tracking-wide">
              {delivery.consignmentId || delivery.merchantOrderId || '—'}
            </div>
            <div className="font-display text-lg font-bold text-slate-900">
              {delivery.recipient.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <StatusPill status={delivery.status} />

          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3 border"
              style={{ borderColor: '#E7E9EE' }}
            >
              <div className="text-[11px] text-slate-500 mb-1">Payment</div>
              <div className="font-display font-semibold text-slate-900 text-sm">
                {delivery.amountToCollect > 0
                  ? `COD ৳${delivery.amountToCollect}`
                  : 'Prepaid'}
              </div>
            </div>
            <div
              className="rounded-xl p-3 border"
              style={{ borderColor: '#E7E9EE' }}
            >
              <div className="text-[11px] text-slate-500 mb-1">Amount</div>
              <div className="font-mono font-semibold text-slate-900 text-sm">
                ৳{delivery.amountToCollect}
              </div>
            </div>
            <div
              className="rounded-xl p-3 border"
              style={{ borderColor: '#E7E9EE' }}
            >
              <div className="text-[11px] text-slate-500 mb-1">
                Delivery fee
              </div>
              <div className="font-mono font-semibold text-slate-900 text-sm">
                ৳{delivery.deliveryFee || 0}
              </div>
            </div>
            <div
              className="rounded-xl p-3 border"
              style={{ borderColor: '#E7E9EE' }}
            >
              <div className="text-[11px] text-slate-500 mb-1">ETA</div>
              <div
                className="font-display font-semibold text-sm"
                style={{ color: cfg.color }}
              >
                {etaFor(delivery.status)}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <MapPin size={13} /> Route
            </div>
            <div className="relative pl-5">
              <div
                className="absolute left-1.25 top-1 bottom-1 w-px"
                style={{ background: '#E7E9EE' }}
              />
              <div className="relative mb-4">
                <div
                  className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full"
                  style={{ background: '#C2410C' }}
                />
                <div className="text-[11px] text-slate-500">
                  Pickup (Store #{delivery.storeId})
                </div>
                <div className="text-sm text-slate-800">
                  {delivery.recipient.areaName
                    ? `${delivery.recipient.areaName}, `
                    : ''}
                  {delivery.recipient.cityName || 'Pathao hub'}
                </div>
              </div>
              <div className="relative">
                <div
                  className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full"
                  style={{ background: cfg.color }}
                />
                <div className="text-[11px] text-slate-500">Dropoff</div>
                <div className="text-sm text-slate-800">
                  {delivery.recipient.address}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recipient
            </div>
            <div
              className="rounded-xl p-3 border flex items-center justify-between"
              style={{ borderColor: '#E7E9EE' }}
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {delivery.recipient.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {delivery.recipient.phone}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${delivery.recipient.phone}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500"
                >
                  <PhoneCall size={14} />
                </a>
                <a
                  href={`https://wa.me/${delivery.recipient.phone.replace(/[^0-9]/g, '')}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500"
                >
                  <MessageSquare size={14} />
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Clock size={13} /> Timeline
            </div>
            <Timeline delivery={delivery} />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onTrack(delivery)}
              className="flex-1 py-2.5 rounded-xl font-display font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: '#C2410C' }}
            >
              <RefreshCw size={14} /> Track from Pathao
            </button>
          </div>

          {isDraft && (
            <div
              className="rounded-xl border p-3 space-y-3"
              style={{ borderColor: '#E7E9EE' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Draft — complete &amp; send to Pathao
                </span>
                {!showPush && (
                  <button
                    onClick={() => setShowPush(true)}
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                    style={{ background: '#1D4ED8' }}
                  >
                    Send to Pathao
                  </button>
                )}
              </div>
              {showPush && (
                <div className="space-y-2">
                  <select
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-white"
                    style={{ borderColor: '#E7E9EE' }}
                    value={sel.storeId ?? ''}
                    onChange={(e) =>
                      setSel((s) => ({ ...s, storeId: Number(e.target.value) }))
                    }
                  >
                    <option value="">Store *</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (#{s.id})
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-white"
                    style={{ borderColor: '#E7E9EE' }}
                    value={sel.cityId ?? ''}
                    onChange={(e) =>
                      setSel((s) => ({ ...s, cityId: Number(e.target.value) }))
                    }
                  >
                    <option value="">City *</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-white disabled:opacity-50"
                    style={{ borderColor: '#E7E9EE' }}
                    disabled={sel.cityId == null}
                    value={sel.zoneId ?? ''}
                    onChange={(e) =>
                      setSel((s) => ({ ...s, zoneId: Number(e.target.value) }))
                    }
                  >
                    <option value="">Zone *</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full px-3 py-2 rounded-xl text-sm border bg-white disabled:opacity-50"
                    style={{ borderColor: '#E7E9EE' }}
                    disabled={sel.zoneId == null}
                    value={sel.areaId ?? ''}
                    onChange={(e) =>
                      setSel((s) => ({ ...s, areaId: Number(e.target.value) }))
                    }
                  >
                    <option value="">Area *</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={
                      pushBusy ||
                      !sel.storeId ||
                      !sel.cityId ||
                      !sel.zoneId ||
                      !sel.areaId
                    }
                    onClick={async () => {
                      try {
                        setPushBusy(true);
                        await onPushDraft(delivery._id, {
                          storeId: sel.storeId!,
                          cityId: sel.cityId!,
                          zoneId: sel.zoneId!,
                          areaId: sel.areaId!,
                          cityName: cities.find((c) => c.id === sel.cityId)
                            ?.name,
                          zoneName: zones.find((z) => z.id === sel.zoneId)
                            ?.name,
                          areaName: areas.find((a) => a.id === sel.areaId)
                            ?.name,
                        });
                        setShowPush(false);
                      } finally {
                        setPushBusy(false);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl font-display font-semibold text-sm text-white disabled:opacity-50"
                    style={{ background: '#15803D' }}
                  >
                    {pushBusy ? 'Sending…' : 'Create Pathao consignment'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Set status:</span>
            <select
              className="flex-1 px-3 py-2 rounded-xl text-sm border bg-white"
              style={{ borderColor: '#E7E9EE' }}
              value={localStatus}
              onChange={(e) => {
                const v = e.target.value as DeliveryStatus;
                setLocalStatus(v);
                onStatusChange(delivery._id, v);
              }}
            >
              {STATUS_TABS.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>(
    'all'
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Delivery | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await deliveryApi.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });
      setDeliveries(data.deliveries || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load deliveries');
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleTrack = async (d: Delivery) => {
    try {
      const { data } = await deliveryApi.track(d._id);
      setDeliveries((prev) =>
        prev.map((x) => (x._id === d._id ? data.delivery : x))
      );
      setSelected(data.delivery);
      toast.success('Status synced from Pathao');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to track');
    }
  };

  const handleStatusChange = async (id: string, status: DeliveryStatus) => {
    try {
      const { data } = await deliveryApi.updateStatus(id, status);
      setDeliveries((prev) =>
        prev.map((x) => (x._id === id ? data.delivery : x))
      );
      setSelected(data.delivery);
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePushDraft = async (
    id: string,
    payload: {
      storeId: number;
      cityId: number;
      zoneId: number;
      areaId: number;
      cityName?: string;
      zoneName?: string;
      areaName?: string;
    }
  ) => {
    try {
      const { data } = await deliveryApi.pushDraft(id, payload);
      setDeliveries((prev) =>
        prev.map((x) => (x._id === id ? data.delivery : x))
      );
      setSelected(data.delivery);
      toast.success(
        data.delivery.consignmentId
          ? `Pathao consignment ${data.delivery.consignmentId} created`
          : 'Sent to Pathao'
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to push to Pathao');
    }
  };

  const filtered = useMemo(() => deliveries, [deliveries]);

  const stats = useMemo(() => {
    const total = deliveries.length;
    const pending = deliveries.filter((d) => d.status === 'pending').length;
    const inTransit = deliveries.filter((d) =>
      ['picked_up', 'in_transit'].includes(d.status)
    ).length;
    const delivered = deliveries.filter((d) => d.status === 'delivered').length;
    return { total, pending, inTransit, delivered };
  }, [deliveries]);

  return (
    <>
      <SiteHeader />

      <div className="min-h-screen w-full" style={{ background: '#F8F8F6' }}>
        <div className="flex">
          <div className="flex-1 min-w-0">
            <main className="p-4 lg:p-8 space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-xl font-bold text-slate-900 leading-tight">
                    Delivery Management
                  </h1>
                  <p className="text-[13px] text-slate-500">
                    Track and manage shipments via Pathao Courier
                  </p>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1">
                <StatCard
                  index={0}
                  label="Total deliveries"
                  value={stats.total}
                  delta="12%"
                  icon={Package}
                  accent="#2563EB"
                />
                <StatCard
                  index={1}
                  label="Pending pickup"
                  value={stats.pending}
                  icon={Clock}
                  accent="#B45309"
                />
                <StatCard
                  index={2}
                  label="In transit"
                  value={stats.inTransit}
                  icon={Truck}
                  accent="#C2410C"
                />
                <StatCard
                  index={3}
                  label="Delivered"
                  value={stats.delivered}
                  delta="8%"
                  icon={CheckCircle2}
                  accent="#15803D"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tracking ID, customer, phone..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none border bg-white focus:border-orange-400 transition-colors"
                    style={{ borderColor: '#E7E9EE' }}
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {STATUS_TABS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize border"
                      style={
                        statusFilter === s
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
                      {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-14 text-center text-slate-400 text-sm">
                  Loading deliveries…
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-sm">
                  No deliveries yet. Create one with “Create shipment”.
                </div>
              ) : (
                <>
                  <div
                    className="hidden md:block rounded-2xl border overflow-hidden bg-white"
                    style={{ borderColor: '#E7E9EE' }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="text-left text-[11px] uppercase tracking-wider text-slate-400"
                          style={{ background: '#FBFBFA' }}
                        >
                          <th className="px-5 py-3 font-semibold">Tracking</th>
                          <th className="px-5 py-3 font-semibold">Customer</th>
                          <th className="px-5 py-3 font-semibold">Route</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold text-right">
                            Amount
                          </th>
                          <th className="px-5 py-3 font-semibold text-right">
                            ETA
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((d, i) => (
                          <tr
                            key={d._id}
                            onClick={() => setSelected(d)}
                            className="cursor-pointer border-t hover:bg-slate-50 transition-colors animate-fadeUp"
                            style={{
                              borderColor: '#EEF0F3',
                              animationDelay: `${i * 30}ms`,
                            }}
                          >
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                              {d.consignmentId || d.merchantOrderId || '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-slate-900 font-medium">
                                {d.recipient.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {d.recipient.phone}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 max-w-55">
                              <div className="text-[12px] text-slate-500 truncate">
                                Store #{d.storeId}
                              </div>
                              <div className="text-[12px] text-slate-400 truncate">
                                ↳ {d.recipient.address}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill status={d.status} />
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono text-slate-700">
                              ৳{d.amountToCollect}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                {etaFor(d.status)}
                                <ChevronRight
                                  size={14}
                                  className="text-slate-300"
                                />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {filtered.map((d, i) => (
                      <div
                        key={d._id}
                        onClick={() => setSelected(d)}
                        className="rounded-2xl border p-4 animate-fadeUp bg-white"
                        style={{
                          borderColor: '#E7E9EE',
                          animationDelay: `${i * 30}ms`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {d.consignmentId || d.merchantOrderId || '—'}
                            </div>
                            <div className="text-slate-900 font-semibold text-sm">
                              {d.recipient.name}
                            </div>
                          </div>
                          <StatusPill status={d.status} />
                        </div>
                        <div className="text-[12px] text-slate-500 mb-1">
                          Store #{d.storeId}
                        </div>
                        <div className="text-[12px] text-slate-400 mb-3">
                          ↳ {d.recipient.address}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            ৳{d.amountToCollect}
                          </span>
                          <span className="font-mono text-slate-700">
                            {etaFor(d.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      <DeliveryDrawer
        delivery={selected}
        onClose={() => setSelected(null)}
        onTrack={handleTrack}
        onStatusChange={handleStatusChange}
        onPushDraft={handlePushDraft}
      />
    </>
  );
}
