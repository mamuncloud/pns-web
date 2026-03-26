import { 
  AuthUser, 
  PricingRule, 
  StockAdjustment, 
  CreatePurchaseDto 
} from "@/types/financial";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    throw new Error(result.message || 'API request failed');
  }

  return result as ApiResponse<T>;
}

export interface Brand {
  id: string;
  name: string;
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
  },
 
  products: {
    getPricing: (id: string) => api.get<PricingRule[]>(`/products/${id}/pricing`),
    getBrands: () => api.get<Brand[]>('/products/brands'),
    create: (data: Record<string, unknown>) => api.post<Record<string, unknown>>('/products', data),
  },

  pricingRules: {
    create: (data: Partial<PricingRule>) => api.post<PricingRule>('/pricing-rules', data),
  },

  stockAdjustments: {
    list: (productId?: string) => api.get<StockAdjustment[]>(`/stock-adjustments${productId ? `?productId=${productId}` : ''}`),
    create: (data: Partial<StockAdjustment>) => api.post<StockAdjustment>('/stock-adjustments', data),
  },

  purchases: {
    create: (data: CreatePurchaseDto) => api.post<{ id: string }>('/purchases', data),
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
  }
};
