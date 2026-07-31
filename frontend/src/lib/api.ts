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

export type OrderItem = {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  totalAmount: number;
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export const orderApi = {
  getMyOrders: () =>
    api.get<{ success: boolean; orders: Order[] }>('/orders/my-orders'),
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

  update: (id: string, data: FormData) =>
    api.put<{ success: boolean; product: any }>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/products/${id}`),
};
