// src/data/dummy/analytics.ts

// ------------------------------------------------------------
// MONTHLY SALES DATA (Last 12 months)
// ------------------------------------------------------------
export interface MonthlySalesData {
  month: string
  revenue: number
  orders: number
  avgOrderValue: number
}

export const monthlySalesData: MonthlySalesData[] = [
  { month: 'Jan', revenue: 45000, orders: 12, avgOrderValue: 3750 },
  { month: 'Feb', revenue: 52000, orders: 15, avgOrderValue: 3467 },
  { month: 'Mar', revenue: 68000, orders: 18, avgOrderValue: 3778 },
  { month: 'Apr', revenue: 49000, orders: 14, avgOrderValue: 3500 },
  { month: 'May', revenue: 73000, orders: 22, avgOrderValue: 3318 },
  { month: 'Jun', revenue: 89000, orders: 25, avgOrderValue: 3560 },
  { month: 'Jul', revenue: 95000, orders: 28, avgOrderValue: 3393 },
  { month: 'Aug', revenue: 82000, orders: 24, avgOrderValue: 3417 },
  { month: 'Sep', revenue: 105000, orders: 30, avgOrderValue: 3500 },
  { month: 'Oct', revenue: 112000, orders: 32, avgOrderValue: 3500 },
  { month: 'Nov', revenue: 98000, orders: 27, avgOrderValue: 3630 },
  { month: 'Dec', revenue: 125000, orders: 35, avgOrderValue: 3571 },
]

// ------------------------------------------------------------
// CATEGORY PERFORMANCE DATA
// ------------------------------------------------------------
export interface CategoryPerformance {
  name: string
  revenue: number
  orders: number
  percentage: number
}

export const categoryData: CategoryPerformance[] = [
  { name: 'Desktop', revenue: 285000, orders: 45, percentage: 28 },
  { name: 'Laptop', revenue: 220000, orders: 38, percentage: 22 },
  { name: 'Components', revenue: 165000, orders: 52, percentage: 16 },
  { name: 'Monitor', revenue: 98000, orders: 25, percentage: 10 },
  { name: 'Accessories', revenue: 82000, orders: 78, percentage: 8 },
  { name: 'Storage', revenue: 65000, orders: 42, percentage: 6 },
  { name: 'Networking', revenue: 45000, orders: 18, percentage: 4 },
  { name: 'Gaming', revenue: 38000, orders: 12, percentage: 3 },
  { name: 'Others', revenue: 32000, orders: 15, percentage: 3 },
]

// ------------------------------------------------------------
// TOP SELLING PRODUCTS
// ------------------------------------------------------------
export interface TopProduct {
  name: string
  sku: string
  revenue: number
  unitsSold: number
  price: number
}

export const topProducts: TopProduct[] = [
  { name: 'Gaming PC - Star Xtreme', sku: 'GP-001', revenue: 255000, unitsSold: 3, price: 85000 },
  { name: 'Gaming Laptop - Pro Gamer X', sku: 'LP-015', revenue: 190000, unitsSold: 2, price: 95000 },
  { name: '27" 4K UHD Monitor', sku: 'MN-012', revenue: 128000, unitsSold: 4, price: 32000 },
  { name: 'RTX 4060 Graphics Card', sku: 'GC-008', revenue: 126000, unitsSold: 3, price: 42000 },
  { name: 'Wireless Mechanical Keyboard', sku: 'KB-042', revenue: 27000, unitsSold: 6, price: 4500 },
  { name: 'Portable SSD 1TB', sku: 'SSD-001', revenue: 25500, unitsSold: 3, price: 8500 },
  { name: 'Smartphone Stand Premium', sku: 'ST-002', revenue: 2400, unitsSold: 3, price: 800 },
  { name: 'HDMI Cable 4K 2m', sku: 'HC-002', revenue: 1500, unitsSold: 3, price: 500 },
  { name: 'Gaming Mouse Pro', sku: 'MS-020', revenue: 7500, unitsSold: 3, price: 2500 },
  { name: 'Wireless Earbuds Pro', sku: 'EB-007', revenue: 7000, unitsSold: 2, price: 3500 },
]

// ------------------------------------------------------------
// ORDER STATUS DISTRIBUTION
// ------------------------------------------------------------
export interface OrderStatusData {
  name: string
  value: number
  color: string
}

export const orderStatusData: OrderStatusData[] = [
  { name: 'Delivered', value: 72, color: '#22c55e' },
  { name: 'Processing', value: 18, color: '#3b82f6' },
  { name: 'Shipped', value: 8, color: '#8b5cf6' },
  { name: 'Pending', value: 5, color: '#eab308' },
  { name: 'Cancelled', value: 3, color: '#ef4444' },
]

// ------------------------------------------------------------
// DAILY SALES DATA (Last 30 days)
// ------------------------------------------------------------
export interface DailySalesData {
  date: string
  revenue: number
  orders: number
}

export const dailySalesData: DailySalesData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short' }),
    revenue: Math.floor(Math.random() * 15000) + 2000,
    orders: Math.floor(Math.random() * 8) + 1,
  }
})

// ------------------------------------------------------------
// OVERVIEW STATISTICS
// ------------------------------------------------------------
export interface OverviewStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  avgOrderValue: number
  conversionRate: number
  itemsPerOrder: number
  repeatCustomerRate: number
}

export const overviewStats: OverviewStats = {
  totalRevenue: 1145400,
  totalOrders: 312,
  totalProducts: 156,
  totalCustomers: 89,
  avgOrderValue: 3672,
  conversionRate: 3.2,
  itemsPerOrder: 2.4,
  repeatCustomerRate: 34,
}

// ------------------------------------------------------------
// PAYMENT METHOD DISTRIBUTION
// ------------------------------------------------------------
export interface PaymentMethodDistribution {
  name: string
  amount: number
  percentage: number
}

export const paymentMethodDistribution: PaymentMethodDistribution[] = [
  { name: 'bKash', amount: 342000, percentage: 35 },
  { name: 'Credit Card', amount: 245000, percentage: 25 },
  { name: 'Nagad', amount: 196000, percentage: 20 },
  { name: 'Cash on Delivery', amount: 98000, percentage: 10 },
  { name: 'Internet Banking', amount: 49000, percentage: 5 },
  { name: 'Rocket', amount: 49000, percentage: 5 },
]

// ------------------------------------------------------------
// MONTHLY GROWTH RATES
// ------------------------------------------------------------
export interface MonthlyGrowth {
  month: string
  revenueGrowth: number
  orderGrowth: number
}

export const monthlyGrowth: MonthlyGrowth[] = [
  { month: 'Jan', revenueGrowth: 5.2, orderGrowth: 3.1 },
  { month: 'Feb', revenueGrowth: 15.6, orderGrowth: 25.0 },
  { month: 'Mar', revenueGrowth: 30.8, orderGrowth: 20.0 },
  { month: 'Apr', revenueGrowth: -28.0, orderGrowth: -22.2 },
  { month: 'May', revenueGrowth: 49.0, orderGrowth: 57.1 },
  { month: 'Jun', revenueGrowth: 21.9, orderGrowth: 13.6 },
  { month: 'Jul', revenueGrowth: 6.7, orderGrowth: 12.0 },
  { month: 'Aug', revenueGrowth: -13.7, orderGrowth: -14.3 },
  { month: 'Sep', revenueGrowth: 28.0, orderGrowth: 25.0 },
  { month: 'Oct', revenueGrowth: 6.7, orderGrowth: 6.7 },
  { month: 'Nov', revenueGrowth: -12.5, orderGrowth: -15.6 },
  { month: 'Dec', revenueGrowth: 27.6, orderGrowth: 29.6 },
]

// ------------------------------------------------------------
// CUSTOMER DEMOGRAPHICS
// ------------------------------------------------------------
export interface CustomerDemographics {
  ageGroup: string
  count: number
  percentage: number
}

export const customerDemographics: CustomerDemographics[] = [
  { ageGroup: '18-25', count: 28, percentage: 31 },
  { ageGroup: '26-35', count: 35, percentage: 39 },
  { ageGroup: '36-45', count: 18, percentage: 20 },
  { ageGroup: '46-60', count: 6, percentage: 7 },
  { ageGroup: '60+', count: 2, percentage: 3 },
]

// ------------------------------------------------------------
// CUSTOMER LOCATION (Bangladesh)
// ------------------------------------------------------------
export interface CustomerLocation {
  city: string
  count: number
  percentage: number
}

export const customerLocations: CustomerLocation[] = [
  { city: 'Dhaka', count: 52, percentage: 58 },
  { city: 'Chittagong', count: 15, percentage: 17 },
  { city: 'Khulna', count: 8, percentage: 9 },
  { city: 'Rajshahi', count: 6, percentage: 7 },
  { city: 'Sylhet', count: 5, percentage: 6 },
  { city: 'Barisal', count: 3, percentage: 3 },
]

// ------------------------------------------------------------
// BANGLADESH CITY ZONES FOR SHIPPING
// ------------------------------------------------------------
export const bangladeshZones = [
  'Dhaka',
  'Chittagong',
  'Khulna',
  'Rajshahi',
  'Sylhet',
  'Barisal',
  'Rangpur',
  'Mymensingh',
]