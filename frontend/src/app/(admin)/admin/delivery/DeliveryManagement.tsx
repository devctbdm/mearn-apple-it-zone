'use client'
import React, { useState, useMemo } from "react";
import {
  Package, Truck, CheckCircle2, XCircle, Search, MapPin, Phone,
  Clock, ChevronRight, X, ArrowUpRight, Bike,
  CircleDot, MoreVertical, PhoneCall, MessageSquare, RefreshCw,
  LayoutGrid, Users, BarChart3, Settings, Menu
} from "lucide-react";

/* ---------------------------------------------------------
   MOCK DATA — replace with calls to your Pathow API
   e.g. GET /api/deliveries, GET /api/deliveries/:id
--------------------------------------------------------- */
const STATUS_CONFIG = {
  pending:    { label: "Pending",     color: "#B45309", bg: "#FEF3E2", icon: Clock },
  picked_up:  { label: "Picked Up",   color: "#1D4ED8", bg: "#EAF1FF", icon: Package },
  in_transit: { label: "In Transit",  color: "#C2410C", bg: "#FFEDE3", icon: Truck },
  delivered:  { label: "Delivered",   color: "#15803D", bg: "#E9F9EE", icon: CheckCircle2 },
  failed:     { label: "Failed",      color: "#B91C1C", bg: "#FDEAEA", icon: XCircle },
  cancelled:  { label: "Cancelled",   color: "#64748B", bg: "#F1F3F6", icon: XCircle },
};

const MOCK_DELIVERIES = [
  { id: "1", trackingId: "PTW-88213", customer: "Nusrat Jahan", phone: "01711-223344", pickup: "Gulshan Circle 2, Dhaka", dropoff: "Bashundhara R/A, Block C", rider: "Rakib Hasan", status: "in_transit", payment: "COD", amount: 1450, distance: "6.2 km", eta: "18 min", createdAt: "10:24 AM" },
  { id: "2", trackingId: "PTW-88214", customer: "Tanvir Ahmed", phone: "01822-556677", pickup: "Dhanmondi 27", dropoff: "Mohammadpur Town Hall", rider: "Sohel Rana", status: "pending", payment: "Prepaid", amount: 890, distance: "4.1 km", eta: "—", createdAt: "10:41 AM" },
  { id: "3", trackingId: "PTW-88215", customer: "Farhana Islam", phone: "01933-887766", pickup: "Uttara Sector 7", dropoff: "Airport Rd, Khilkhet", rider: "Imran Kabir", status: "delivered", payment: "COD", amount: 2100, distance: "8.7 km", eta: "Delivered", createdAt: "09:12 AM" },
  { id: "4", trackingId: "PTW-88216", customer: "Shakil Mahmud", phone: "01611-998877", pickup: "Banani DOHS", dropoff: "Gulshan 1", rider: "—", status: "pending", payment: "Prepaid", amount: 650, distance: "3.4 km", eta: "—", createdAt: "11:02 AM" },
  { id: "5", trackingId: "PTW-88217", customer: "Ayesha Siddika", phone: "01755-334455", pickup: "Mirpur 10", dropoff: "Agargaon", rider: "Rakib Hasan", status: "picked_up", payment: "COD", amount: 1200, distance: "5.5 km", eta: "26 min", createdAt: "11:15 AM" },
  { id: "6", trackingId: "PTW-88218", customer: "Kamal Hossain", phone: "01944-112233", pickup: "Khulna Sonadanga", dropoff: "Khulna Boyra", rider: "Jasim Uddin", status: "failed", payment: "COD", amount: 780, distance: "3.9 km", eta: "—", createdAt: "08:47 AM" },
  { id: "7", trackingId: "PTW-88219", customer: "Rumana Akter", phone: "01677-445566", pickup: "Chattogram GEC", dropoff: "Chattogram Agrabad", rider: "Delwar Hossain", status: "delivered", payment: "Prepaid", amount: 1990, distance: "7.3 km", eta: "Delivered", createdAt: "07:58 AM" },
  { id: "8", trackingId: "PTW-88220", customer: "Mahdi Hasan", phone: "01511-667788", pickup: "Sylhet Zindabazar", dropoff: "Sylhet Amberkhana", rider: "—", status: "cancelled", payment: "COD", amount: 540, distance: "2.8 km", eta: "—", createdAt: "09:30 AM" },
  { id: "9", trackingId: "PTW-88221", customer: "Sabrina Chowdhury", phone: "01822-990011", pickup: "Dhanmondi 15", dropoff: "Elephant Rd", rider: "Sohel Rana", status: "in_transit", payment: "COD", amount: 1330, distance: "3.1 km", eta: "9 min", createdAt: "11:28 AM" },
  { id: "10", trackingId: "PTW-88222", customer: "Habibur Rahman", phone: "01933-223311", pickup: "Wari, Old Dhaka", dropoff: "Jatrabari", rider: "Imran Kabir", status: "picked_up", payment: "Prepaid", amount: 970, distance: "4.6 km", eta: "31 min", createdAt: "11:33 AM" },
];

const STATUS_TABS = ["all", "pending", "picked_up", "in_transit", "delivered", "failed", "cancelled"];

/* ---------------------------------------------------------
   FONT LOADER — swap to next/font/google in your Next.js app
--------------------------------------------------------- */
function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      .font-display { font-family: 'Sora', sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slideIn { animation: slideIn 0.28s cubic-bezier(0.16,1,0.3,1); }
      .animate-fadeUp { animation: fadeUp 0.4s ease both; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: #E2E5EA; border-radius: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
    `}</style>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status];
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

function StatCard({ label, value, delta, icon: Icon, accent, index }) {
  return (
    <div
      className="animate-fadeUp relative flex-1 min-w-[150px] rounded-2xl p-4 border bg-white"
      style={{ borderColor: "#E7E9EE", animationDelay: `${index * 60}ms` }}
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
      <div className="font-display text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-[13px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function DeliveryDrawer({ delivery, onClose }) {
  if (!delivery) return null;
  const cfg = STATUS_CONFIG[delivery.status];
  const timeline = [
    { label: "Order placed", time: delivery.createdAt, done: true },
    { label: "Rider assigned", time: delivery.rider !== "—" ? "10:29 AM" : "—", done: delivery.rider !== "—" },
    { label: "Picked up", time: ["picked_up", "in_transit", "delivered"].includes(delivery.status) ? "10:38 AM" : "—", done: ["picked_up", "in_transit", "delivered"].includes(delivery.status) },
    { label: "In transit", time: ["in_transit", "delivered"].includes(delivery.status) ? "10:44 AM" : "—", done: ["in_transit", "delivered"].includes(delivery.status) },
    { label: "Delivered", time: delivery.status === "delivered" ? "11:02 AM" : "—", done: delivery.status === "delivered" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto animate-slideIn border-l bg-white"
        style={{ borderColor: "#E7E9EE" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-white" style={{ borderColor: "#E7E9EE" }}>
          <div>
            <div className="font-mono text-xs text-slate-400 tracking-wide">{delivery.trackingId}</div>
            <div className="font-display text-lg font-bold text-slate-900">{delivery.customer}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <StatusPill status={delivery.status} />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border" style={{ borderColor: "#E7E9EE" }}>
              <div className="text-[11px] text-slate-500 mb-1">Payment</div>
              <div className="font-display font-semibold text-slate-900 text-sm">{delivery.payment}</div>
            </div>
            <div className="rounded-xl p-3 border" style={{ borderColor: "#E7E9EE" }}>
              <div className="text-[11px] text-slate-500 mb-1">Amount</div>
              <div className="font-mono font-semibold text-slate-900 text-sm">৳{delivery.amount}</div>
            </div>
            <div className="rounded-xl p-3 border" style={{ borderColor: "#E7E9EE" }}>
              <div className="text-[11px] text-slate-500 mb-1">Distance</div>
              <div className="font-display font-semibold text-slate-900 text-sm">{delivery.distance}</div>
            </div>
            <div className="rounded-xl p-3 border" style={{ borderColor: "#E7E9EE" }}>
              <div className="text-[11px] text-slate-500 mb-1">ETA</div>
              <div className="font-display font-semibold text-sm" style={{ color: cfg.color }}>{delivery.eta}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <MapPin size={13} /> Route
            </div>
            <div className="relative pl-5">
              <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: "#E7E9EE" }} />
              <div className="relative mb-4">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: "#C2410C" }} />
                <div className="text-[11px] text-slate-500">Pickup</div>
                <div className="text-sm text-slate-800">{delivery.pickup}</div>
              </div>
              <div className="relative">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                <div className="text-[11px] text-slate-500">Dropoff</div>
                <div className="text-sm text-slate-800">{delivery.dropoff}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Bike size={13} /> Rider
            </div>
            {delivery.rider !== "—" ? (
              <div className="flex items-center justify-between rounded-xl p-3 border" style={{ borderColor: "#E7E9EE" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white" style={{ background: "#C2410C" }}>
                    {delivery.rider.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{delivery.rider}</div>
                    <div className="text-[11px] text-slate-500">{delivery.phone}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500">
                    <PhoneCall size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500">
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-3 border border-dashed flex items-center justify-between" style={{ borderColor: "#D8DCE3" }}>
                <span className="text-sm text-slate-500">No rider assigned</span>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: "#C2410C" }}>
                  Assign rider
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Clock size={13} /> Timeline
            </div>
            <div className="space-y-3">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CircleDot size={14} className={t.done ? "text-orange-500" : "text-slate-300"} />
                  <div className="flex-1 text-sm" style={{ color: t.done ? "#1E293B" : "#A3AAB8" }}>{t.label}</div>
                  <div className="font-mono text-[11px] text-slate-400">{t.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="flex-1 py-2.5 rounded-xl font-display font-semibold text-sm text-white flex items-center justify-center gap-2" style={{ background: "#C2410C" }}>
              <RefreshCw size={14} /> Update status
            </button>
            <button className="px-4 py-2.5 rounded-xl border text-slate-500 text-sm" style={{ borderColor: "#E7E9EE" }}>
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_DELIVERIES.filter((d) => {
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        d.trackingId.toLowerCase().includes(q) ||
        d.customer.toLowerCase().includes(q) ||
        d.rider.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const total = MOCK_DELIVERIES.length;
    const pending = MOCK_DELIVERIES.filter(d => d.status === "pending").length;
    const inTransit = MOCK_DELIVERIES.filter(d => ["picked_up", "in_transit"].includes(d.status)).length;
    const delivered = MOCK_DELIVERIES.filter(d => d.status === "delivered").length;
    return { total, pending, inTransit, delivered };
  }, []);

  const navItems = [
    { icon: LayoutGrid, label: "Dashboard", active: false },
    { icon: Package, label: "Deliveries", active: true },
    { icon: Users, label: "Riders", active: false },
    { icon: BarChart3, label: "Reports", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: "#F8F8F6" }}>
      <FontLoader />

      <div className="flex">
        

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <div className="flex-1 min-w-0">
          <main className="p-4 lg:p-8 space-y-6">
            {/* Page title */}
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900 leading-tight">Delivery Management</h1>
                <p className="text-[13px] text-slate-500">Track and manage all active deliveries in real time</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              <StatCard index={0} label="Total deliveries" value={stats.total} delta="12%" icon={Package} accent="#2563EB" />
              <StatCard index={1} label="Pending pickup" value={stats.pending} icon={Clock} accent="#B45309" />
              <StatCard index={2} label="In transit" value={stats.inTransit} icon={Truck} accent="#C2410C" />
              <StatCard index={3} label="Delivered today" value={stats.delivered} delta="8%" icon={CheckCircle2} accent="#15803D" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tracking ID, customer, rider..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none border bg-white focus:border-orange-400 transition-colors"
                  style={{ borderColor: "#E7E9EE" }}
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
                        ? { background: "#C2410C", color: "#FFFFFF", borderColor: "#C2410C" }
                        : { background: "#FFFFFF", color: "#64748B", borderColor: "#E7E9EE" }
                    }
                  >
                    {s === "all" ? "All" : STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table (md+) */}
            <div className="hidden md:block rounded-2xl border overflow-hidden bg-white" style={{ borderColor: "#E7E9EE" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400" style={{ background: "#FBFBFA" }}>
                    <th className="px-5 py-3 font-semibold">Tracking</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Route</th>
                    <th className="px-5 py-3 font-semibold">Rider</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Amount</th>
                    <th className="px-5 py-3 font-semibold text-right">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelected(d)}
                      className="cursor-pointer border-t hover:bg-slate-50 transition-colors animate-fadeUp"
                      style={{ borderColor: "#EEF0F3", animationDelay: `${i * 30}ms` }}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{d.trackingId}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-900 font-medium">{d.customer}</div>
                        <div className="text-[11px] text-slate-400">{d.phone}</div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <div className="text-[12px] text-slate-500 truncate">{d.pickup}</div>
                        <div className="text-[12px] text-slate-400 truncate">↳ {d.dropoff}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{d.rider}</td>
                      <td className="px-5 py-3.5"><StatusPill status={d.status} /></td>
                      <td className="px-5 py-3.5 text-right font-mono text-slate-700">৳{d.amount}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                          {d.eta}
                          <ChevronRight size={14} className="text-slate-300" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-14 text-center text-slate-400 text-sm">No deliveries match your filters.</div>
              )}
            </div>

            {/* Cards (mobile) */}
            <div className="md:hidden space-y-3">
              {filtered.map((d, i) => (
                <div
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="rounded-2xl border p-4 animate-fadeUp bg-white"
                  style={{ borderColor: "#E7E9EE", animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-mono text-[11px] text-slate-400">{d.trackingId}</div>
                      <div className="text-slate-900 font-semibold text-sm">{d.customer}</div>
                    </div>
                    <StatusPill status={d.status} />
                  </div>
                  <div className="text-[12px] text-slate-500 mb-1">{d.pickup}</div>
                  <div className="text-[12px] text-slate-400 mb-3">↳ {d.dropoff}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{d.rider}</span>
                    <span className="font-mono text-slate-700">৳{d.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      <DeliveryDrawer delivery={selected} onClose={() => setSelected(null)} />
    </div>
  );
}