'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  Trash2,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Clock,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { orderApi, type Order } from '@/lib/api';

// --- Types ---
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  email: string;
  avatar: string;
  amount: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceStats {
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
  cancelledCount: number;
}

// --- Mappers ---
const shortId = (id: string) => `#${id.slice(-8).toUpperCase()}`;

const getCustomer = (o: Order) => (typeof o.user === 'object' ? o.user : null);

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NA';

const addDays = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const orderToInvoice = (o: Order): Invoice => {
  const customer = getCustomer(o);
  const name = customer?.name || 'Customer';
  const amount = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const dueDate = addDays(o.createdAt, 30);

  let status: InvoiceStatus = 'pending';
  const payStatus = o.payment?.status;
  if (payStatus === 'paid') {
    status = 'paid';
  } else if (
    payStatus === 'failed' ||
    payStatus === 'cancelled' ||
    o.orderStatus === 'cancelled'
  ) {
    status = 'cancelled';
  } else if (new Date() > new Date(dueDate)) {
    status = 'overdue';
  }

  return {
    id: o._id,
    invoiceNumber: `INV-${o._id.slice(-8).toUpperCase()}`,
    customer: name,
    email: customer?.email || '',
    avatar: initials(name),
    amount,
    discount: o.coupon?.discount || 0,
    tax: 0,
    total: o.totalAmount,
    status,
    date: o.createdAt,
    dueDate,
    items: o.items.map((i) => ({
      description: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
      total: i.price * i.quantity,
    })),
    notes: o.note || undefined,
  };
};

// --- Utilities ---
const formatCurrency = (amount: number) =>
  `৳${(amount || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(value).toLocaleDateString('en-US', opts);

// --- Components ---

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = {
    paid: {
      label: 'Paid',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    pending: {
      label: 'Pending',
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    overdue: {
      label: 'Overdue',
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    cancelled: {
      label: 'Cancelled',
      className:
        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800',
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const c = config[status];

  return (
    <Badge
      variant="outline"
      className={`${c.className} flex items-center w-fit`}
    >
      {c.icon}
      {c.label}
    </Badge>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-25" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-30 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-35" />
            <Skeleton className="h-3 w-25" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-25" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-17.5 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-22.5" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-15 ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}

function InvoiceDetailDrawer({
  invoice,
  onRefetch,
  onClose,
}: {
  invoice: Invoice | null;
  onRefetch: () => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const isMobile = useIsMobile();
  const invoiceContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invoice) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [invoice]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      onClose();
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    setCancelling(true);
    try {
      await orderApi.updateStatus(invoice.id, 'cancelled');
      toast.success(`Invoice ${invoice.invoiceNumber} cancelled`);
      onClose();
      onRefetch();
    } catch {
      toast.error('Failed to cancel invoice');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    if (invoiceContentRef.current) {
      const printContent = invoiceContentRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Invoice</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; padding: 20px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .invoice-title { font-size: 24px; font-weight: bold; }
          .invoice-number { font-size: 18px; color: #666; }
          .customer-info { display: flex; gap: 15px; margin-bottom: 20px; }
          .customer-details h4 { margin: 0 0 5px 0; }
          .customer-details p { margin: 0; color: #666; }
          .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .date-item p { margin: 0 0 5px 0; }
          .date-item .label { color: #666; font-size: 14px; }
          .date-item .value { font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: 600; }
          .totals { margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #ddd; padding-top: 10px; }
          .notes { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .notes p { margin: 0 0 5px 0; }
          .notes .label { font-weight: 600; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = () => {
    if (invoiceContentRef.current && invoice) {
      const element = invoiceContentRef.current;
      
      // Create a temporary iframe with hex-only CSS
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        return;
      }
      
      // Write the HTML with hex-only CSS
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: sans-serif; color: #000; background: #fff; padding: 20px; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .invoice-title { font-size: 24px; font-weight: bold; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .invoice-table th { background: #f5f5f5; }
            .total-row { display: flex; justify-content: space-between; margin-top: 10px; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .badge-paid { background: #dcfce7; color: #166534; }
            .badge-pending { background: #fef9c3; color: #854d0e; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait for iframe to load, then generate PDF
      setTimeout(() => {
        const iframeElement = iframeDoc.body;
        
        const opt = {
          margin: 10,
          filename: `${invoice.invoiceNumber}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
          },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        };
        
        html2pdf().set(opt).from(iframeElement).save().then(() => {
          document.body.removeChild(iframe);
        }).catch((error) => {
          console.error('PDF generation failed:', error);
          document.body.removeChild(iframe);
          alert('PDF generation failed. Please use the print dialog to save as PDF.');
          window.print();
        });
      }, 500);
    }
  };

  if (!invoice) return null;

  const canCancel = invoice.status === 'pending' || invoice.status === 'overdue';

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? 'down' : 'right'}
    >
      <DrawerContent className="max-h-[96vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto px-6 py-6">
          <DrawerHeader className="text-left px-0 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl">
                {invoice.invoiceNumber}
              </DrawerTitle>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <DrawerDescription>
              Issued on{' '}
              {new Date(invoice.date).toLocaleDateString('en-US', {
                dateStyle: 'long',
              })}
            </DrawerDescription>
          </DrawerHeader>

          <div ref={invoiceContentRef} className="space-y-8">
            {/* Customer Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                  {invoice.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-lg">{invoice.customer}</h4>
                <p className="text-sm text-muted-foreground">{invoice.email}</p>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Issue Date
                </p>
                <p className="font-medium">
                  {new Date(invoice.date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Due Date
                </p>
                <p
                  className={`font-medium ${
                    invoice.status === 'overdue' ? 'text-red-600' : ''
                  }`}
                >
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <h4 className="font-semibold mb-4">Line Items</h4>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-emerald-600">
                    -{formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>

            {invoice.notes && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
              </div>
              {canCancel && (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  <Trash2 className="h-4 w-4" />
                  {cancelling ? 'Cancelling...' : 'Cancel Invoice'}
                </Button>
              )}
            </div>
          </div>

          <DrawerFooter className="px-0 pt-6">
            <DrawerClose className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full">
              Close
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- Main Page ---

export default function InvoiceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>(
    'all'
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice;
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);

  const itemsPerPage = 5;

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await orderApi.getAllOrders({ limit: 100 });
      setInvoices((data.orders || []).map(orderToInvoice));
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Stats
  const stats: InvoiceStats = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        if (inv.status === 'paid') acc.totalPaid += inv.total;
        if (inv.status === 'pending') acc.totalOutstanding += inv.total;
        if (inv.status === 'overdue') acc.totalOverdue += inv.total;
        if (inv.status === 'cancelled') acc.cancelledCount += 1;
        return acc;
      },
      { totalOutstanding: 0, totalPaid: 0, totalOverdue: 0, cancelledCount: 0 }
    );
  }, [invoices]);

  // Filter & Sort
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer.toLowerCase().includes(q) ||
          inv.email.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, searchQuery, statusFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openDetailDrawer = (invoice: Invoice) => {
    setDetailInvoice(null);
    setTimeout(() => setDetailInvoice(invoice), 0);
  };

  const handleSort = (key: keyof Invoice) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExportCSV = () => {
    const headers = [
      'Invoice',
      'Customer',
      'Email',
      'Date',
      'Due Date',
      'Status',
      'Total',
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = filteredInvoices.map((inv) =>
      [
        inv.invoiceNumber,
        inv.customer,
        inv.email,
        inv.date,
        inv.dueDate,
        inv.status,
        inv.total.toFixed(2),
      ]
        .map((v) => escape(String(v)))
        .join(',')
    );
    const csv = [headers.map((h) => escape(h)).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredInvoices.length} invoices to CSV`);
  };

  const handleChangeInvoiceStatus = async (
    invoice: Invoice,
    status: InvoiceStatus
  ) => {
    if (status === 'overdue' || status === invoice.status) return;
    try {
      if (status === 'cancelled') {
        await orderApi.updateStatus(invoice.id, 'cancelled');
      } else {
        await orderApi.updatePaymentStatus(invoice.id, status);
      }
      toast.success(`Invoice ${invoice.invoiceNumber} marked as ${status}`);
      await fetchInvoices();
    } catch {
      toast.error('Failed to update invoice status');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Track payments from customer orders and export invoices.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : [
              {
                title: 'Total Paid',
                value: formatCurrency(stats.totalPaid),
                change: 'All time revenue',
                icon: <DollarSign className="h-4 w-4" />,
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
              },
              {
                title: 'Outstanding',
                value: formatCurrency(stats.totalOutstanding),
                change: 'Awaiting payment',
                icon: <Clock className="h-4 w-4" />,
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
              },
              {
                title: 'Overdue',
                value: formatCurrency(stats.totalOverdue),
                change: 'Requires action',
                icon: <AlertCircle className="h-4 w-4" />,
                color: 'text-red-600 bg-red-50 dark:bg-red-950/30',
              },
              {
                title: 'Cancelled',
                value: stats.cancelledCount.toString(),
                change: 'Failed or refunded',
                icon: <XCircle className="h-4 w-4" />,
                color: 'text-red-600 bg-red-50 dark:bg-red-950/30',
              },
            ].map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices, customers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as InvoiceStatus | 'all');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-35">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportCSV}
                disabled={filteredInvoices.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 data-[state=open]:bg-accent"
                          onClick={() => handleSort('invoiceNumber')}
                        >
                          Invoice
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={() => handleSort('date')}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} />
                      ))
                    ) : paginatedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <p>No invoices found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{invoice.invoiceNumber}</span>
                              <span className="text-xs text-muted-foreground">
                                {invoice.items.length} items
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-primary/10">
                                  {invoice.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {invoice.customer}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {invoice.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <InvoiceStatusBadge status={invoice.status} />
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                invoice.status === 'overdue'
                                  ? 'text-red-600 font-medium'
                                  : 'text-muted-foreground'
                              }
                            >
                              {new Date(invoice.dueDate).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="group/btn inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDetailDrawer(invoice)}
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>
                                    Change Status
                                  </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                {invoice.status !== 'paid' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeInvoiceStatus(invoice, 'paid')
                                    }
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />{' '}
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                {invoice.status !== 'pending' &&
                                  invoice.status !== 'overdue' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleChangeInvoiceStatus(
                                          invoice,
                                          'pending'
                                        )
                                      }
                                    >
                                      <Clock className="h-4 w-4 mr-2" /> Mark
                                      as Pending
                                    </DropdownMenuItem>
                                  )}
                                {invoice.status !== 'cancelled' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeInvoiceStatus(
                                        invoice,
                                        'cancelled'
                                      )
                                    }
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" /> Mark
                                    as Cancelled
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="grid" className="m-0">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-30 mb-2" />
                        <Skeleton className="h-4 w-45" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-45" />
                        <Skeleton className="h-8 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedInvoices.map((invoice) => (
                    <Card
                      key={invoice.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <CardDescription>
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10">
                              {invoice.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {invoice.customer}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.email}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total
                          </span>
                          <span className="text-xl font-bold">
                            {formatCurrency(invoice.total)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => openDetailDrawer(invoice)}
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {!loading && filteredInvoices.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}{' '}
                of {filteredInvoices.length} invoices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <InvoiceDetailDrawer
        key={detailInvoice?.id || 'drawer'}
        invoice={detailInvoice}
        onRefetch={fetchInvoices}
        onClose={() => setDetailInvoice(null)}
      />
    </div>
  );
}
