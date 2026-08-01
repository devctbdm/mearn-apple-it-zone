import api from './axios';

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  active: boolean;
  productCount?: number;
  imageUrl: string;
  bannerUrl: string;
  featured: boolean;
  sortOrder: number;
  color: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryForm = {
  name: string;
  slug?: string;
  description: string;
  parentId: string | null;
  active: boolean;
  imageUrl: string;
  bannerUrl: string;
  featured: boolean;
  sortOrder: number;
  color: string;
};

function toFormData(data: Record<string, any>, files?: { image?: File | null; banner?: File | null }): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(data)) {
    if (val !== null && val !== undefined) {
      fd.append(key, String(val));
    }
  }
  if (files?.image) fd.append('image', files.image);
  if (files?.banner) fd.append('banner', files.banner);
  return fd;
}

export const categoryApi = {
  getAll: () => api.get<{ success: boolean; categories: Category[] }>('/categories'),

  getById: (id: string) =>
    api.get<{ success: boolean; category: Category }>(`/categories/${id}`),

  create: (data: CategoryForm, files?: { image?: File | null; banner?: File | null }) =>
    api.post<{ success: boolean; category: Category }>(
      '/categories',
      toFormData(data as any, files),
    ),

  update: (id: string, data: Partial<CategoryForm>, files?: { image?: File | null; banner?: File | null }) =>
    api.put<{ success: boolean; category: Category }>(
      `/categories/${id}`,
      toFormData(data as any, files),
    ),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/categories/${id}`),

  reorder: (orders: { id: string; sortOrder: number }[]) =>
    api.put<{ success: boolean; message: string }>('/categories/reorder', { orders }),
};

export type SliderType = 'hero' | 'ad_top' | 'ad_bottom';

export type Slider = {
  _id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  type: SliderType;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SliderForm = {
  title: string;
  description: string;
  image: string;
  link: string;
  type: SliderType;
  active: boolean;
  sortOrder: number;
};

export const sliderApi = {
  getAll: (params?: { active?: boolean }) =>
    api.get<{ success: boolean; sliders: Slider[] }>('/sliders', {
      params: params ? { active: params.active ? 'true' : undefined } : undefined,
    }),

  create: (data: SliderForm, image?: File | null) =>
    api.post<{ success: boolean; slider: Slider }>(
      '/sliders',
      toFormData(data as any, { image }),
    ),

  update: (id: string, data: Partial<SliderForm>, image?: File | null) =>
    api.put<{ success: boolean; slider: Slider }>(
      `/sliders/${id}`,
      toFormData(data as any, { image }),
    ),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/sliders/${id}`),

  reorder: (orders: { id: string; sortOrder: number }[]) =>
    api.put<{ success: boolean; message: string }>('/sliders/reorder', { orders }),
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  users: T[];
};

export const userApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get<PaginatedResponse<AdminUser>>('/users', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; user: AdminUser }>(`/users/${id}`),

  create: (data: { name: string; email: string; password: string; phone?: string; role?: string; status?: string }) =>
    api.post<{ success: boolean; user: AdminUser }>('/users', data),

  update: (id: string, data: Partial<{ name: string; email: string; phone: string; role: string; status: string; password: string }>) =>
    api.put<{ success: boolean; user: AdminUser }>(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/${id}`),
};

export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  status: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

export type CustomerPaginatedResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  customers: Customer[];
};

export const customerApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<CustomerPaginatedResponse>('/customers', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; customer: Customer }>(`/customers/${id}`),
};

export type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Team' | 'Viewer';
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: string;
};

export const teamApi = {
  getAll: () => api.get<{ success: boolean; members: TeamMember[] }>('/team'),

  create: (data: { name: string; email: string; role: string }) =>
    api.post<{ success: boolean; member: TeamMember }>('/team', data),

  update: (id: string, data: Partial<{ name: string; email: string; role: string; status: string }>) =>
    api.put<{ success: boolean; member: TeamMember }>(`/team/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/team/${id}`),
};

export type Session = {
  _id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
};

export type StoreSettings = {
  _id: string;
  storeName: string;
  storeUrl: string;
  email: string;
  phone: string;
  description: string;
  logoUrl: string;
  currency: string;
  timezone: string;
  address: string;
};

export const storeApi = {
  get: () => api.get<{ success: boolean; settings: StoreSettings }>('/store'),
  update: (data: Partial<StoreSettings>) =>
    api.put<{ success: boolean; settings: StoreSettings }>('/store', data),
};

export type PaymentGateway = {
  _id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
};

export const paymentSettingsApi = {
  getAll: () => api.get<{ success: boolean; gateways: PaymentGateway[] }>('/payment-settings'),
  update: (id: string, data: { enabled?: boolean; config?: Record<string, any> }) =>
    api.put<{ success: boolean; gateway: PaymentGateway }>(`/payment-settings/${id}`, data),
};

export type AuthMe = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
};

export type SavedAddress = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
};

export const authApi = {
  getMe: () => api.get<{ success: boolean; user: AuthMe }>('/auth/me'),

  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: Partial<AuthMe['address']>;
  }) => api.put<{ success: boolean; user: AuthMe }>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ success: boolean; message: string }>('/auth/me/password', data),

  getSessions: () =>
    api.get<{ success: boolean; sessions: Session[] }>('/auth/me/sessions'),

  revokeSession: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/auth/me/sessions/${id}`),

  getAddresses: () =>
    api.get<{ success: boolean; addresses: SavedAddress[] }>('/auth/me/addresses'),

  addAddress: (data: Partial<SavedAddress>) =>
    api.post<{ success: boolean; addresses: SavedAddress[] }>('/auth/me/addresses', data),

  updateAddress: (id: string, data: Partial<SavedAddress>) =>
    api.put<{ success: boolean; addresses: SavedAddress[] }>(`/auth/me/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete<{ success: boolean; addresses: SavedAddress[] }>(`/auth/me/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.put<{ success: boolean; addresses: SavedAddress[] }>(`/auth/me/addresses/${id}/default`),
};

export type OrderStatus =
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  product: string | { _id: string; name: string };
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  _id: string;
  user:
    | string
    | { _id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  totalAmount: number;
  coupon?: {
    code: string;
    discount: number;
  };
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
  orderStatus: OrderStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderStats = {
  total: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

export const orderApi = {
  getMyOrders: () =>
    api.get<{ success: boolean; orders: Order[] }>('/orders/my-orders'),
  getAllOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{
      success: boolean;
      total: number;
      page: number;
      pages: number;
      orders: Order[];
    }>('/orders', { params }),

  getStats: () =>
    api.get<{ success: boolean; stats: OrderStats }>('/orders/stats'),

  updateStatus: (id: string, status: OrderStatus) =>
    api.put<{ success: boolean; order: Order }>(`/orders/${id}/status`, {
      status,
    }),

  create: (data: {
    items: { product: string; quantity: number }[];
    shippingAddress: Order['shippingAddress'];
    paymentMethod: string;
    note?: string;
    couponCode?: string;
  }) => api.post<{ success: boolean; order: Order }>('/orders', data),
};

export type DashboardStats = {
  revenue: number;
  orders: number;
  customers: number;
  productsSold: number;
  products: number;
  ordersByStatus: {
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: Order[];
  topProducts: {
    _id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
  }[];
  salesByCategory: { name: string; value: number }[];
  monthlyRevenue: { label: string; value: number }[];
};

export const dashboardApi = {
  getStats: () =>
    api.get<{ success: boolean; stats: DashboardStats }>('/dashboard'),
};

export type AnalyticsPoint = {
  month: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
};

export type AnalyticsStats = {
  stats: {
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    productsSold: number;
    avgOrderValue: number;
    avgItemsPerOrder: number;
    repeatCustomerRate: number;
    ordersByStatus: {
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  monthly: AnalyticsPoint[];
  daily: AnalyticsPoint[];
  topProducts: {
    _id: string;
    name: string;
    image: string;
    price: number;
    sku?: string;
    productCode?: string;
    unitsSold: number;
    revenue: number;
  }[];
  categories: {
    name: string;
    revenue: number;
    orders: number;
    percentage: number;
  }[];
};

export const analyticsApi = {
  getStats: () =>
    api.get<{ success: boolean; data: AnalyticsStats }>('/analytics'),
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  status: string;
  featured: boolean;
  specifications?: Record<string, any>;
  images?: string[];
};

export const productApi = {
  create: (data: FormData) =>
    api.post<{ success: boolean; product: any }>('/products', data),

  getAll: (params?: Record<string, any>) =>
    api.get<{ success: boolean; products: any[] }>('/products', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; product: any }>(`/products/${id}`),

  getBySlug: (slug: string) =>
    api.get<{ success: boolean; product: any }>(`/products/slug/${slug}`),

  addRating: (id: string, data: { rating: number; comment?: string }) =>
    api.post<{ success: boolean; product: any }>(`/products/${id}/ratings`, data),

  update: (id: string, data: FormData) =>
    api.put<{ success: boolean; product: any }>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/products/${id}`),
};

export type Review = {
  _id: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  featured: boolean;
  createdAt: string;
  user: { _id: string; name: string } | null;
  product: { _id: string; name: string; slug: string; image: string } | null;
};

export type ReviewStats = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  featured: number;
  averageRating: number;
  distribution: { rating: number; count: number }[];
};

export type ReviewPaginatedResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  reviews: Review[];
};

export const reviewApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    rating?: string;
    featured?: string;
  }) => api.get<ReviewPaginatedResponse>('/reviews', { params }),

  getStats: () => api.get<{ success: boolean; stats: ReviewStats }>('/reviews/stats'),

  update: (id: string, data: { status?: string; featured?: boolean }) =>
    api.patch<{ success: boolean; review: Review }>(`/reviews/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reviews/${id}`),
};

export type Question = {
  _id: string;
  question: string;
  answer: string;
  status: 'pending' | 'answered' | 'rejected';
  featured: boolean;
  createdAt: string;
  answeredAt: string | null;
  product: { _id: string; name: string; slug: string; image: string } | null;
  user: { _id: string; name: string } | null;
  answeredBy: { _id: string; name: string } | null;
};

export type QuestionStats = {
  total: number;
  pending: number;
  answered: number;
  rejected: number;
  featured: number;
};

export type QuestionPaginatedResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  questions: Question[];
};

export const questionApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    featured?: string;
    productId?: string;
  }) => api.get<QuestionPaginatedResponse>('/questions', { params }),

  getStats: () => api.get<{ success: boolean; stats: QuestionStats }>('/questions/stats'),

  getByProduct: (productId: string) =>
    api.get<{ success: boolean; count: number; questions: Question[] }>(
      `/questions/product/${productId}`
    ),

  ask: (productId: string, question: string) =>
    api.post<{ success: boolean; question: Question }>('/questions', {
      productId,
      question,
    }),

  update: (id: string, data: { answer?: string; status?: string; featured?: boolean }) =>
    api.patch<{ success: boolean; question: Question }>(`/questions/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/questions/${id}`),
};

export type PromoCode = {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  maxDiscount: number;
  maxUses: number;
  perUserLimit: number;
  usageCount: number;
  startDate: string | null;
  endDate: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

export type PromoStats = {
  total: number;
  active: number;
  inactive: number;
  totalRedemptions: number;
  expiringSoon: number;
};

export type PromoPaginatedResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  promos: PromoCode[];
};

export type PromoFormData = {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrder: number;
  maxDiscount: number;
  maxUses: number;
  perUserLimit: number;
  startDate: string | null;
  endDate: string | null;
  status: 'active' | 'inactive';
};

export const promoApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }) => api.get<PromoPaginatedResponse>('/promo', { params }),

  getStats: () => api.get<{ success: boolean; stats: PromoStats }>('/promo/stats'),

  create: (data: PromoFormData) =>
    api.post<{ success: boolean; promo: PromoCode }>('/promo', data),

  update: (id: string, data: Partial<PromoFormData>) =>
    api.put<{ success: boolean; promo: PromoCode }>(`/promo/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/promo/${id}`),

  validate: (code: string, subtotal: number) =>
    api.post<{ success: boolean; promo: Partial<PromoCode>; discount: number }>('/promo/validate', {
      code,
      subtotal,
    }),
};
