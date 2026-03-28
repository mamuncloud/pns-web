import { 
  AuthUser, 
  PricingRule, 
  StockAdjustment, 
  Purchase,
  CreatePurchaseDto,
  Repack,
  CreateRepackDto,
  StockMovement,
  AdjustStockDto,
} from "@/types/financial";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  statusCode: number;
  response?: ApiResponse<unknown>;

  constructor(message: string, statusCode: number, response?: ApiResponse<unknown>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new ApiError(result.message || `API request failed at ${url}`, response.status, result);
  }

  return result as ApiResponse<T>;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}) => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body?: unknown, options: RequestInit = {}) => 
    fetchApi<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  
  put: <T>(endpoint: string, body: unknown, options: RequestInit = {}) => 
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  
  patch: <T>(endpoint: string, body: unknown, options: RequestInit = {}) => 
    fetchApi<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  
  delete: <T>(endpoint: string, options: RequestInit = {}) => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
 
  auth: {
    requestLogin: (email: string) => api.post<{ message: string }>('/auth/request-login', { email }),
    verifyLogin: (token: string) => api.get<{ access_token: string; user: AuthUser }>(`/auth/verify?token=${token}`),
    reissue: () => api.post<{ access_token: string }>('/auth/reissue'),
  },
 
  products: {
    getPricing: (id: string) => api.get<PricingRule[]>(`/products/${id}/pricing`),
    getBrands: () => api.get<Brand[]>('/products/brands'),
    createBrand: (name: string) => api.post<Brand>('/products/brands', { name }),
    create: (data: Record<string, unknown>) => api.post<Record<string, unknown>>('/products', data),
  },

  pricingRules: {
    create: (data: Partial<PricingRule>) => api.post<PricingRule>('/pricing-rules', data),
  },

  stockAdjustments: {
    list: (productId?: string) => api.get<StockAdjustment[]>(`/stock-adjustments${productId ? `?productId=${productId}` : ''}`),
    create: (data: Partial<StockAdjustment>) => api.post<StockAdjustment>('/stock-adjustments', data),
  },

  stock: {
    movements: (params?: { productVariantId?: string; productId?: string; type?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.productVariantId) qs.append('productVariantId', params.productVariantId);
      if (params?.productId) qs.append('productId', params.productId);
      if (params?.type) qs.append('type', params.type);
      if (params?.limit) qs.append('limit', params.limit.toString());
      return api.get<StockMovement[]>(`/stock/movements?${qs.toString()}`);
    },
    adjust: (data: AdjustStockDto) => api.post<StockMovement>('/stock/adjust', data),
  },

  purchases: {
    list: () => api.get<Purchase[]>('/purchases'),
    get: (id: string) => api.get<Purchase>(`/purchases/${id}`),
    create: (data: CreatePurchaseDto) => api.post<{ id: string }>('/purchases', data),
    update: (id: string, data: Partial<CreatePurchaseDto>) => api.put<Purchase>(`/purchases/${id}`, data),
    delete: (id: string) => api.delete<{ message: string }>(`/purchases/${id}`),
  },
  
  storage: {
    uploadMultiple: (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      return fetchApi<string[]>('/storage/upload', {
        method: 'POST',
        body: formData,
        headers: {} as Record<string, string>,
      });
    },
    uploadSingle: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchApi<string>('/storage/upload-single', {
        method: 'POST',
        body: formData,
      });
    }
  },

  suppliers: {
    list: () => api.get<Supplier[]>('/suppliers'),
  },
  
  storeSettings: {
    get: () => api.get<{ isStoreOpen: boolean }>('/store-settings'),
    update: (isStoreOpen: boolean) => api.patch<{ isStoreOpen: boolean }>('/store-settings', { isStoreOpen }),
  },

  repacks: {
    list: (productId?: string) =>
      api.get<Repack[]>(`/repacks${productId ? `?productId=${productId}` : ''}`),
    get: (id: string) => api.get<Repack>(`/repacks/${id}`),
    create: (data: CreateRepackDto) => api.post<{ id: string; message: string }>('/repacks', data),
  },
};
