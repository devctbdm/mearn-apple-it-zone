'use client';

import { useEffect, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Activity,
  Eye,
  Download,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';

// --- Types ---
interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  avatar: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'cancelled';
  date: string;
  items: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
  image: string;
}

// --- Mock Data ---
const stats: StatCard[] = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1% from last month',
    trend: 'up',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    title: 'Orders',
    value: '+2,350',
    change: '+15.2% from last month',
    trend: 'up',
    icon: <ShoppingCart className="h-4 w-4" />,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  },
  {
    title: 'Active Customers',
    value: '+12,234',
    change: '+8.4% from last month',
    trend: 'up',
    icon: <Users className="h-4 w-4" />,
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30',
  },
  {
    title: 'Products Sold',
    value: '+4,231',
    change: '-3.2% from last month',
    trend: 'down',
    icon: <Package className="h-4 w-4" />,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  },
];

const recentOrders: Order[] = [
  {
    id: 'ORD-7523',
    customer: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    avatar: 'SC',
    amount: 1250.0,
    status: 'completed',
    date: '2024-01-15',
    items: 3,
  },
  {
    id: 'ORD-7524',
    customer: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    avatar: 'MJ',
    amount: 89.99,
    status: 'pending',
    date: '2024-01-15',
    items: 1,
  },
  {
    id: 'ORD-7525',
    customer: 'Emily Davis',
    email: 'emily.d@email.com',
    avatar: 'ED',
    amount: 567.5,
    status: 'processing',
    date: '2024-01-14',
    items: 5,
  },
  {
    id: 'ORD-7526',
    customer: 'James Wilson',
    email: 'j.wilson@email.com',
    avatar: 'JW',
    amount: 2340.0,
    status: 'completed',
    date: '2024-01-14',
    items: 8,
  },
  {
    id: 'ORD-7527',
    customer: 'Anna Martinez',
    email: 'anna.m@email.com',
    avatar: 'AM',
    amount: 129.99,
    status: 'cancelled',
    date: '2024-01-13',
    items: 2,
  },
];

const topProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    category: 'Electronics',
    sales: 1240,
    revenue: 148760,
    stock: 45,
    image: '/products/headphones.jpg',
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    category: 'Fashion',
    sales: 980,
    revenue: 29400,
    stock: 12,
    image: '/products/tshirt.jpg',
  },
  {
    id: '3',
    name: 'Smart Watch Series 5',
    category: 'Electronics',
    sales: 856,
    revenue: 171200,
    stock: 78,
    image: '/products/watch.jpg',
  },
  {
    id: '4',
    name: 'Ceramic Coffee Mug Set',
    category: 'Home',
    sales: 743,
    revenue: 22290,
    stock: 156,
    image: '/products/mugs.jpg',
  },
  {
    id: '5',
    name: 'Leather Weekend Bag',
    category: 'Fashion',
    sales: 621,
    revenue: 93150,
    stock: 8,
    image: '/products/bag.jpg',
  },
];

// --- Components ---

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-25" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-35 mb-2" />
        <Skeleton className="h-4 w-30" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <Skeleton className="h-6 w-37.5 mb-2" />
        <Skeleton className="h-4 w-62.5" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-75 w-full" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-50" />
            <Skeleton className="h-4 w-37.5" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-15" />
        </div>
      ))}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const variants = {
    completed:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    pending:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    processing:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    cancelled:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function RevenueChart() {
  // Simulated chart using div bars for zero-dependency
  const data = [
    { label: 'Jan', value: 65, prev: 45 },
    { label: 'Feb', value: 78, prev: 52 },
    { label: 'Mar', value: 52, prev: 48 },
    { label: 'Apr', value: 89, prev: 60 },
    { label: 'May', value: 95, prev: 75 },
    { label: 'Jun', value: 72, prev: 68 },
    { label: 'Jul', value: 85, prev: 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Revenue Overview
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">$45,231</span>
            <span className="text-sm text-emerald-600 font-medium flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">This Year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span className="text-xs text-muted-foreground">Last Year</span>
          </div>
        </div>
      </div>

      <div className="relative h-75 w-full">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((item, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end gap-1 group"
            >
              <div className="relative w-full flex flex-col justify-end gap-1">
                <div
                  className="w-full bg-muted rounded-t-sm transition-all duration-500"
                  style={{ height: `${item.prev * 2.5}px` }}
                />
                <div
                  className="w-full bg-primary rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                  style={{ height: `${item.value * 2.5}px` }}
                />
              </div>
              <span className="text-xs text-center text-muted-foreground mt-2">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [open, setOpen] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value || '7d')}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat, i) => (
              <Card key={i} className="relative overflow-hidden">
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
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        stat.trend === 'up'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }
                    >
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Monthly revenue comparison with previous period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        )}

        {/* Recent Activity / Sales Breakdown */}
        {loading ? (
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-35 mb-2" />
              <Skeleton className="h-4 w-50" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Distribution across product categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { name: 'Electronics', value: 45, color: 'bg-blue-500' },
                { name: 'Fashion', value: 32, color: 'bg-violet-500' },
                { name: 'Home & Garden', value: 15, color: 'bg-amber-500' },
                { name: 'Sports', value: 8, color: 'bg-emerald-500' },
              ].map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-muted-foreground">
                      {category.value}%
                    </span>
                  </div>
                  <Progress value={category.value} className="h-2">
                    <div
                      className={`h-full ${category.color} rounded-full`}
                      style={{ width: `${category.value}%` }}
                    />
                  </Progress>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Section: Orders & Products */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  You have {recentOrders.length} orders this week
                </CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12.5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} className="group">
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-xs bg-primary/10">
                                {order.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {order.customer}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {order.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${order.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Drawer
                            open={open}
                            onOpenChange={setOpen}
                            showSwipeHandle={isMobile}
                            swipeDirection={isMobile ? 'down' : 'right'}
                          >
                            <DrawerTrigger>
                              <span>View</span>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>Order {order.id}</DrawerTitle>
                                <DrawerDescription>
                                  Order details for {order.customer}
                                </DrawerDescription>
                              </DrawerHeader>
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Customer
                                    </p>
                                    <p className="text-sm font-medium">
                                      {order.customer}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Email
                                    </p>
                                    <p className="text-sm">{order.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Status
                                    </p>
                                    <OrderStatusBadge status={order.status} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Date
                                    </p>
                                    <p className="text-sm">
                                      {new Date(order.date).toLocaleDateString(
                                        'en-US',
                                        {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        }
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Items
                                    </p>
                                    <p className="text-sm">{order.items}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Amount
                                    </p>
                                    <p className="text-sm font-medium">
                                      ${order.amount.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <DrawerFooter>
                                <DrawerClose>
                                  Close
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best performing products this month
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                              📦
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {product.sales.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${product.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(product.stock / 200) * 100}
                              className="h-2 w-15"
                            />
                            <span
                              className={`text-xs ${
                                product.stock < 20
                                  ? 'text-red-600 font-medium'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {product.stock}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
