'use client';
import { useState, useMemo } from 'react';
import {
  Eye,
  Pencil,
  XCircle,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Clock,
  Loader2,
  CheckCircle2,
  Download,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/site-header';

type OrderStatus =
  'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type StatusFilter = OrderStatus | 'all';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

const products = [
  { name: 'Wireless Headphones', price: 99.99 },
  { name: 'USB-C Cable', price: 12.5 },
  { name: 'Bluetooth Speaker', price: 89.5 },
  { name: 'Smart Watch', price: 249.0 },
  { name: 'Phone Case', price: 15.0 },
  { name: 'Mechanical Keyboard', price: 149.99 },
  { name: 'Gaming Mouse', price: 59.0 },
  { name: 'Laptop Stand', price: 39.0 },
  { name: 'Webcam HD', price: 79.0 },
  { name: 'Desk Lamp', price: 45.0 },
];
const names = [
  'Alice Johnson',
  'Bob Smith',
  'Carol Davis',
  'David Lee',
  'Eva Martinez',
  'Frank Wilson',
  'Grace Kim',
  'Henry Brown',
  'Ivy Chen',
  'Jack Taylor',
  'Kate Miller',
  'Liam Garcia',
  'Mia Anderson',
  'Noah Thomas',
  'Olivia White',
  'Peter Hall',
  'Quinn Adams',
  'Rachel Green',
  'Sam Clarke',
  'Tina Lopez',
  'Uma Patel',
  'Victor Ross',
  'Wendy Cole',
  'Xander Reed',
  'Yara Fox',
];
const statuses: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const generateOrders = (): Order[] =>
  Array.from({ length: 25 }, (_, i) => {
    const itemCount = (i % 3) + 1;
    const items: OrderItem[] = Array.from({ length: itemCount }, (_, j) => {
      const p = products[(i + j) % products.length];
      return { name: p.name, qty: (j % 2) + 1, price: p.price };
    });
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const day = ((i * 3) % 28) + 1;
    return {
      id: `ORD-${1024 + i}`,
      customer: names[i % names.length],
      email:
        names[i % names.length].toLowerCase().replace(' ', '.') +
        '@example.com',
      date: `2026-06-${String(day).padStart(2, '0')}`,
      total: Number(total.toFixed(2)),
      status: statuses[i % statuses.length],
      items,
      shippingAddress: `${100 + i} Main St, City ${i + 1}`,
      paymentMethod: i % 2 === 0 ? 'Visa •••• 4242' : 'Mastercard •••• 8888',
    };
  });

const initialOrders: Order[] = generateOrders();

const statusVariant: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  processing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  shipped: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
};

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    }),
    [orders]
  );

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const matchesQ =
          o.id.toLowerCase().includes(query.toLowerCase()) ||
          o.customer.toLowerCase().includes(query.toLowerCase()) ||
          o.email.toLowerCase().includes(query.toLowerCase());
        const matchesS = statusFilter === 'all' || o.status === statusFilter;
        return matchesQ && matchesS;
      }),
    [orders, query, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSaveStatus = () => {
    if (!editOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === editOrder.id ? { ...o, status: editStatus } : o
      )
    );
    toast.success(`Order ${editOrder.id} status updated to ${editStatus}`);
    setEditOrder(null);
  };

  const handleCancel = () => {
    if (!cancelOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelOrder.id ? { ...o, status: 'cancelled' } : o
      )
    );
    toast.success(`Order ${cancelOrder.id} cancelled`);
    setCancelOrder(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Customer',
      'Email',
      'Date',
      'Total',
      'Status',
      'Payment',
      'Shipping Address',
      'Items',
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filtered.map((o) =>
      [
        o.id,
        o.customer,
        o.email,
        o.date,
        o.total.toFixed(2),
        o.status,
        o.paymentMethod,
        o.shippingAddress,
        o.items
          .map((it) => `${it.qty}x ${it.name} @$${it.price.toFixed(2)}`)
          .join('; '),
      ]
        .map((v) => escape(String(v)))
        .join(',')
    );
    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} orders to CSV`);
  };

  const handlePrintInvoice = (order: Order) => {
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) {
      toast.error('Please allow popups to print invoices.');
      return;
    }
    const itemsRows = order.items
      .map(
        (it) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.qty}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${it.price.toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(it.price * it.qty).toFixed(2)}</td>
          </tr>`
      )
      .join('');
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${order.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #111; padding: 32px; }
            h1 { margin: 0 0 4px; font-size: 24px; }
            .muted { color: #666; font-size: 12px; }
            .row { display: flex; justify-content: space-between; margin-top: 24px; gap: 24px; }
            .box { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #111; font-size: 12px; text-transform: uppercase; }
            .total { text-align: right; font-size: 18px; font-weight: 700; margin-top: 16px; }
            .footer { margin-top: 32px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Invoice</h1>
          <div class="muted">Order ${order.id} · ${order.date}</div>
          <div class="row">
            <div class="box">
              <div class="muted">Billed to</div>
              <div><strong>${order.customer}</strong></div>
              <div>${order.email}</div>
              <div>${order.shippingAddress}</div>
            </div>
            <div class="box" style="text-align:right;">
              <div class="muted">Payment</div>
              <div>${order.paymentMethod}</div>
              <div class="muted" style="margin-top:8px;">Status</div>
              <div style="text-transform:capitalize;">${order.status}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="total">Total: $${order.total.toFixed(2)}</div>
          <div class="footer">Thank you for your order.</div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.total,
      icon: ShoppingBag,
      color: 'text-foreground',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Loader2,
      color: 'text-blue-600',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ];

  return (
    <div>
      <SiteHeader
        title="Orders Management"
        description="Manage and track all customer orders."
      />
      <div className="px-4 py-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.customer}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        className={statusVariant[order.status]}
                        variant="secondary"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="flex items-center gap-2">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditOrder(order);
                              setEditStatus(order.status);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePrintInvoice(order)}
                          >
                            <Printer className="mr-2 h-4 w-4" /> Print invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            disabled={order.status === 'cancelled'}
                            onClick={() => setCancelOrder(order)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancel order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paged.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            –{(currentPage - 1) * PAGE_SIZE + paged.length} of {filtered.length}
          </p>
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1)
                  )
                  .map((p, idx, arr) => (
                    <PaginationItem key={p}>
                      {idx > 0 && p - arr[idx - 1] > 1 ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* View details dialog */}
        <Dialog
          open={!!viewOrder}
          onOpenChange={(o) => !o && setViewOrder(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Order {viewOrder?.id}</DialogTitle>
              <DialogDescription>Placed on {viewOrder?.date}</DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Customer</div>
                    <div className="text-muted-foreground">
                      {viewOrder.customer}
                    </div>
                    <div className="text-muted-foreground">
                      {viewOrder.email}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Status</div>
                    <Badge
                      className={statusVariant[viewOrder.status]}
                      variant="secondary"
                    >
                      {viewOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="font-medium">Shipping Address</div>
                  <div className="text-muted-foreground">
                    {viewOrder.shippingAddress}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Payment</div>
                  <div className="text-muted-foreground">
                    {viewOrder.paymentMethod}
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-medium">Items</div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewOrder.items.map((it, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{it.name}</TableCell>
                            <TableCell className="text-center">
                              {it.qty}
                            </TableCell>
                            <TableCell className="text-right">
                              ${(it.price * it.qty).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-3 flex justify-end font-semibold">
                    Total: ${viewOrder.total.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            {viewOrder && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => handlePrintInvoice(viewOrder)}>
                  <Printer className="mr-2 h-4 w-4" /> Print invoice
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit status dialog */}
        <Dialog
          open={!!editOrder}
          onOpenChange={(o) => !o && setEditOrder(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Order Status</DialogTitle>
              <DialogDescription>
                Update status for {editOrder?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOrder(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStatus}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel confirm */}
        <AlertDialog
          open={!!cancelOrder}
          onOpenChange={(o) => !o && setCancelOrder(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
              <AlertDialogDescription>
                Order {cancelOrder?.id} will be marked as cancelled. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep order</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>
                Cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
