declare global {
  interface Window {
    PLAYWRIGHT_DEBUG?: boolean;
  }
}

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
  Order,
  CreateOrderDto,
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  Consignment,
  CreateConsignmentDto,
  SettleConsignmentDto,
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
  url?: string;

  constructor(message: string, statusCode: number, response?: ApiResponse<unknown>, url?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    this.url = url;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const isFormData = options.body instanceof FormData;

  const makeRequest = async (tokenValue: string | null) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(tokenValue ? { 'Authorization': `Bearer ${tokenValue}` } : {}),
        ...options.headers,
      },
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401 && typeof window !== 'undefined') {
    // Prevent infinite loop if the refresh endpoint itself returns 401
    if (endpoint === '/auth/refresh') {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/staff') {
        window.location.href = '/staff';
      }
      const result = await response.json();
      throw new ApiError(result.message || 'Session expired', 401, result);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          const newToken = refreshResult.data.access_token;
          localStorage.setItem('auth_token', newToken);
          isRefreshing = false;
          onTokenRefreshed(newToken);
          
          // Retry original request
          response = await makeRequest(newToken);
        } else {
          isRefreshing = false;
          localStorage.removeItem('auth_token');
          if (window.location.pathname !== '/staff') {
            window.location.href = '/staff';
          }
          const result = await refreshResponse.json();
          throw new ApiError(result.message || 'Session expired', 401, result);
        }
      } catch (error) {
        isRefreshing = false;
        throw error;
      }
    } else {
      // Wait for refresh to complete
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            const retryResponse = await makeRequest(newToken);
            if (typeof window !== 'undefined' && window.PLAYWRIGHT_DEBUG) {
              console.log(`[API DEBUG] ${options.method || 'GET'} ${url}`, options.headers);
            }
            const result = await retryResponse.json();
            if (!retryResponse.ok) {
              const errorMsg = `[${retryResponse.status}] ${options.method || "GET"} ${url}: ${result.message || "Forbidden"}`;
              console.warn(errorMsg, result);
              reject(new ApiError(errorMsg, retryResponse.status, result, url));
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        });
      }) as unknown as Promise<ApiResponse<T>>;
    }
  }

  const result = await response.json();

  if (!response.ok) {
    const errorMsg = `[${response.status}] ${options.method || 'GET'} ${url}: ${result.message || 'Forbidden'}`;
    console.warn(errorMsg, result);
    throw new ApiError(errorMsg, response.status, result, url);
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

export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export type PackageType = 'Medium' | 'Small' | '250gr' | '500gr' | '1kg' | 'bal';

export interface CreateVariantDto {
  package: PackageType;
  price: number;
  initialStock?: number;
  sku?: string;
  sizeInGram?: number;
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
    requestLogin: (identifier: string) => api.post<{ message: string }>('/auth/request-login', { email: identifier }),
    verifyLogin: (token: string) => api.get<{ access_token: string; user: AuthUser }>(`/auth/verify?token=${token}`),
    refresh: () => api.post<{ access_token: string }>('/auth/refresh'),
    logout: () => api.post<{ success: boolean }>('/auth/logout'),
  },

  employees: {
    list: (search?: string) => api.get<Employee[]>(`/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    create: (data: CreateEmployeeDto) => api.post<Employee>('/employees', data),
    update: (id: string, data: UpdateEmployeeDto) => api.patch<Employee>(`/employees/${id}`, data),
    delete: (id: string) => api.delete<{ message: string; id: string }>(`/employees/${id}`),
  },

 
  products: {
    list: (page = 1, limit = 10, taste?: string, search?: string) => {
      const qs = new URLSearchParams();
      qs.append('page', String(page));
      qs.append('limit', String(limit));
      if (taste) qs.append('taste', taste);
      if (search) qs.append('search', search);
      return api.get<unknown>(`/products?${qs.toString()}`);
    },
    getPricing: (id: string) => api.get<PricingRule[]>(`/products/${id}/pricing`),
    getBrands: (search?: string) => api.get<Brand[]>(`/products/brands${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    createBrand: (name: string) => api.post<Brand>('/products/brands', { name }),
    create: (data: Record<string, unknown>) => api.post<Record<string, unknown>>('/products', data),
    update: (id: string, data: Record<string, unknown>) => api.patch<Record<string, unknown>>(`/products/${id}`, data),
    createVariant: (productId: string, data: CreateVariantDto) => api.post<Record<string, unknown>>(`/products/${productId}/variants`, data),
  },

  pricingRules: {
    create: (data: Partial<PricingRule>) => api.post<PricingRule>('/pricing-rules', data),
  },

  stockAdjustments: {
    list: (productId?: string) => api.get<StockAdjustment[]>(`/stock-adjustments${productId ? `?productId=${productId}` : ''}`),
    create: (data: Partial<StockAdjustment>) => api.post<StockAdjustment>('/stock-adjustments', data),
  },

  stock: {
    movements: (params?: { productVariantId?: string; productId?: string; type?: string; limit?: number; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.productVariantId) qs.append('productVariantId', params.productVariantId);
      if (params?.productId) qs.append('productId', params.productId);
      if (params?.type) qs.append('type', params.type);
      if (params?.limit) qs.append('limit', params.limit.toString());
      if (params?.search) qs.append('search', params.search);
      return api.get<StockMovement[]>(`/stock/movements?${qs.toString()}`);
    },
    adjust: (data: AdjustStockDto) => api.post<StockMovement>('/stock/adjust', data),
  },

  purchases: {
    list: (search?: string) => api.get<Purchase[]>(`/purchases${search ? `?search=${encodeURIComponent(search)}` : ''}`),
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
    list: (search?: string) => api.get<Supplier[]>(`/suppliers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    create: (data: CreateSupplierDto) => api.post<Supplier>('/suppliers', data),
    update: (id: string, data: UpdateSupplierDto) => api.patch<Supplier>(`/suppliers/${id}`, data),
    delete: (id: string) => api.delete<{ message: string; id: string }>(`/suppliers/${id}`),
  },
  
  storeSettings: {
    get: () => api.get<{ isStoreOpen: boolean }>('/store-settings'),
    update: (isStoreOpen: boolean) => api.patch<{ isStoreOpen: boolean }>('/store-settings', { isStoreOpen }),
  },

  repacks: {
    list: (productId?: string, search?: string) => {
      const qs = new URLSearchParams();
      if (productId) qs.append('productId', productId);
      if (search) qs.append('search', search);
      const query = qs.toString();
      return api.get<Repack[]>(`/repacks${query ? `?${query}` : ''}`);
    },
    get: (id: string) => api.get<Repack>(`/repacks/${id}`),
    create: (data: CreateRepackDto) => api.post<{ id: string; message: string }>('/repacks', data),
  },

  orders: {
    list: (search?: string) => api.get<Order[]>(`/orders${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get: (id: string) => api.get<Order>(`/orders/${id}`),
    create: (data: CreateOrderDto) => api.post<{ data: Order; message: string }>('/orders', data),
  },

  consignment: {
    list: (search?: string) => api.get<Consignment[]>(`/consignment${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get: (id: string) => api.get<Consignment>(`/consignment/${id}`),
    create: (data: CreateConsignmentDto) => api.post<Consignment>('/consignment', data),
    settle: (data: SettleConsignmentDto) => 
      api.post<{ message: string; totalAmountSettledDelta: number; status: string }>('/consignment/settle', data),
  },
};
