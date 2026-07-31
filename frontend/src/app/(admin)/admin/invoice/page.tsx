'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Plus,
  Mail,
  Printer,
  Trash2,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Clock,
  FileSpreadsheet,
  Eye,
  Send,
  Pencil,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// --- Types ---
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';

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
  draftCount: number;
}

// --- Mock Data ---
const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2024-0012',
    customer: 'Acme Corporation',
    email: 'billing@acme.com',
    avatar: 'AC',
    amount: 2450.0,
    tax: 245.0,
    total: 2695.0,
    status: 'paid',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    items: [
      {
        description: 'Premium Plan - Monthly',
        quantity: 1,
        unitPrice: 2000,
        total: 2000,
      },
      {
        description: 'Additional Storage (500GB)',
        quantity: 1,
        unitPrice: 450,
        total: 450,
      },
    ],
    notes: 'Thank you for your business!',
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2024-0013',
    customer: 'Stark Industries',
    email: 'accounts@stark.com',
    avatar: 'SI',
    amount: 8750.0,
    tax: 875.0,
    total: 9625.0,
    status: 'pending',
    date: '2024-01-18',
    dueDate: '2024-02-18',
    items: [
      {
        description: 'Enterprise License',
        quantity: 5,
        unitPrice: 1500,
        total: 7500,
      },
      {
        description: 'Implementation Fee',
        quantity: 1,
        unitPrice: 1250,
        total: 1250,
      },
    ],
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2024-0014',
    customer: 'Wayne Enterprises',
    email: 'finance@wayne.com',
    avatar: 'WE',
    amount: 3200.0,
    tax: 320.0,
    total: 3520.0,
    status: 'overdue',
    date: '2023-12-01',
    dueDate: '2023-12-31',
    items: [
      {
        description: 'Consulting Services',
        quantity: 40,
        unitPrice: 80,
        total: 3200,
      },
    ],
    notes: 'Payment reminder sent on Jan 5th.',
  },
  {
    id: 'inv_4',
    invoiceNumber: 'INV-2024-0015',
    customer: 'Cyberdyne Systems',
    email: 'ap@cyberdyne.com',
    avatar: 'CS',
    amount: 1299.99,
    tax: 130.0,
    total: 1429.99,
    status: 'draft',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    items: [
      {
        description: 'Hardware - Server Rack',
        quantity: 1,
        unitPrice: 1299.99,
        total: 1299.99,
      },
    ],
  },
  {
    id: 'inv_5',
    invoiceNumber: 'INV-2024-0016',
    customer: 'Massive Dynamic',
    email: 'billing@massivedynamic.com',
    avatar: 'MD',
    amount: 5400.0,
    tax: 540.0,
    total: 5940.0,
    status: 'paid',
    date: '2024-01-10',
    dueDate: '2024-02-10',
    items: [
      {
        description: 'Annual Subscription',
        quantity: 1,
        unitPrice: 5400,
        total: 5400,
      },
    ],
  },
  {
    id: 'inv_6',
    invoiceNumber: 'INV-2024-0017',
    customer: 'Umbrella Corp',
    email: 'finance@umbrella.com',
    avatar: 'UC',
    amount: 780.0,
    tax: 78.0,
    total: 858.0,
    status: 'cancelled',
    date: '2024-01-05',
    dueDate: '2024-02-05',
    items: [
      {
        description: 'Lab Equipment Rental',
        quantity: 2,
        unitPrice: 390,
        total: 780,
      },
    ],
  },
  {
    id: 'inv_7',
    invoiceNumber: 'INV-2024-0018',
    customer: 'Soylent Corp',
    email: 'ap@soylent.com',
    avatar: 'SC',
    amount: 4500.0,
    tax: 450.0,
    total: 4950.0,
    status: 'pending',
    date: '2024-01-22',
    dueDate: '2024-02-22',
    items: [
      {
        description: 'Raw Materials - Batch #442',
        quantity: 100,
        unitPrice: 45,
        total: 4500,
      },
    ],
  },
  {
    id: 'inv_8',
    invoiceNumber: 'INV-2024-0019',
    customer: 'Initech',
    email: 'billing@initech.com',
    avatar: 'IN',
    amount: 12500.0,
    tax: 1250.0,
    total: 13750.0,
    status: 'overdue',
    date: '2023-11-15',
    dueDate: '2023-12-15',
    items: [
      {
        description: 'Software Development',
        quantity: 100,
        unitPrice: 125,
        total: 12500,
      },
    ],
    notes: '3rd reminder sent. Escalating to collections.',
  },
];

// --- Utilities ---
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

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
    draft: {
      label: 'Draft',
      className:
        'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800',
      icon: <FileText className="h-3 w-3 mr-1" />,
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
        <Skeleton className="h-4 w-4" />
      </TableCell>
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

function CreateInvoiceDialog({
  open,
  onOpenChange,
  onCreateInvoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
}) {
  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    avatar: '',
    amount: 0,
    tax: 0,
    total: 0,
    status: 'draft' as InvoiceStatus,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
  });

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    // Recalculate totals
    const amount = newItems.reduce((sum, item) => sum + item.total, 0);
    const tax = amount * 0.1; // 10% tax
    const total = amount + tax;
    
    setFormData({ ...formData, items: newItems, amount, tax, total });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const amount = newItems.reduce((sum, item) => sum + item.total, 0);
    const tax = amount * 0.1;
    const total = amount + tax;
    setFormData({ ...formData, items: newItems, amount, tax, total });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateInvoice(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      customer: '',
      email: '',
      avatar: '',
      amount: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new invoice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Date</label>
              <Input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                required
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Items</label>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-5">
                    <Input
                      required
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      required
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1 text-right font-medium">
                    ${item.total.toFixed(2)}
                  </div>
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${formData.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>${formData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${formData.total.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDetailDrawer({
  invoice,
  onStatusChange,
  onClose,
}: {
  invoice: Invoice | null;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
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

  const statusActions: {
    label: string;
    status: InvoiceStatus;
    variant: 'default' | 'outline' | 'destructive';
  }[] = [
    {
      label: 'Mark as Paid',
      status: 'paid' as const,
      variant: 'default' as const,
    },
    {
      label: 'Mark as Pending',
      status: 'pending' as const,
      variant: 'outline' as const,
    },
    {
      label: 'Mark as Overdue',
      status: 'overdue' as const,
      variant: 'destructive' as const,
    },
  ].filter((a) => a.status !== invoice.status);

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
                          ${item.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.total.toFixed(2)}
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
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${invoice.total.toFixed(2)}</span>
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
              {statusActions.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {statusActions.map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      className="gap-2"
                      onClick={() => {
                        onStatusChange(invoice.id, action.status);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> {action.label}
                    </Button>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete Invoice
              </Button>
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
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set()
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Stats
  const stats: InvoiceStats = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        if (inv.status === 'paid') acc.totalPaid += inv.total;
        if (inv.status === 'pending') acc.totalOutstanding += inv.total;
        if (inv.status === 'overdue') acc.totalOverdue += inv.total;
        if (inv.status === 'draft') acc.draftCount += 1;
        return acc;
      },
      { totalOutstanding: 0, totalPaid: 0, totalOverdue: 0, draftCount: 0 }
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

  const toggleSelection = (id: string) => {
    const next = new Set(selectedInvoices);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedInvoices(next);
  };

  const toggleAll = () => {
    if (selectedInvoices.size === paginatedInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(paginatedInvoices.map((i) => i.id)));
    }
  };

  const handleSort = (key: keyof Invoice) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  };

  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(4, '0')}`,
      avatar: invoiceData.customer
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceToDelete));
      setSelectedInvoices((prev) => {
        const next = new Set(prev);
        next.delete(invoiceToDelete);
        return next;
      });
    }
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const handleBulkDelete = () => {
    setInvoices((prev) => prev.filter((inv) => !selectedInvoices.has(inv.id)));
    setSelectedInvoices(new Set());
  };

  const handleBulkStatusChange = (status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        selectedInvoices.has(inv.id) ? { ...inv, status } : inv
      )
    );
    setSelectedInvoices(new Set());
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage your invoices, track payments, and send reminders.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
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
                title: 'Drafts',
                value: stats.draftCount.toString(),
                change: 'Unsent invoices',
                icon: <FileText className="h-4 w-4" />,
                color: 'text-slate-600 bg-slate-50 dark:bg-slate-950/30',
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedInvoices.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedInvoices.size} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                      Bulk Actions
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => handleBulkStatusChange('paid')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkStatusChange('pending')}
                      >
                        <Clock className="h-4 w-4 mr-2" /> Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleBulkDelete}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <Button variant="outline" size="sm" className="gap-2">
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
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            paginatedInvoices.length > 0 &&
                            selectedInvoices.size === paginatedInvoices.length
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
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
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <p>No invoices found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedInvoices.has(invoice.id)}
                              onCheckedChange={() =>
                                toggleSelection(invoice.id)
                              }
                            />
                          </TableCell>
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
                                <DropdownMenuItem>
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" /> Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" /> Download
                                  PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {invoice.status !== 'paid' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(invoice.id, 'paid')
                                    }
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />{' '}
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(invoice.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                          >
                            <Send className="h-3 w-3" /> Send
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
        onStatusChange={handleStatusChange}
        onClose={() => setDetailInvoice(null)}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
}
