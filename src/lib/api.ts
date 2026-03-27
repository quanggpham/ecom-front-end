import type {
  ApiResponse,
  PaginatedResponse,
  Category,
  Product,
  Cart,
  Order,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CheckoutRequest,
  ProductSearchParams,
  Coupon,
  CouponRequest,
  User,
  UserRequest,
  UpdateProfileRequest,
  Address,
  AddressRequest,
  RevenueData,
  TopProduct,
  Review,
  ReviewStats,
  ReviewResponse,
  ReviewRequest,
  ReviewableOrder,
  ReviewStatus,
} from '@/types';

// API Base URL - update this if needed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Token management - with safe localStorage access for sandboxed environments
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('token');
    } catch {
      // localStorage not available (sandboxed environment)
      return null;
    }
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('token', token);
    } catch {
      // localStorage not available (sandboxed environment)
      console.warn('localStorage not available');
    }
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
    } catch {
      // localStorage not available (sandboxed environment)
      console.warn('localStorage not available');
    }
  }
};

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetchApi<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetchApi<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response;
  },

  logout: (): void => {
    removeToken();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  /**
   * Probe an admin-only endpoint to verify if the current token belongs to an ADMIN.
   * Returns 'ADMIN' if request succeeds (HTTP 200), 'USER' if it returns 403/401.
   */
  checkIsAdmin: async (): Promise<'ADMIN' | 'USER'> => {
    try {
      const token = getToken();
      if (!token) return 'USER';
      // Use the admin statistics endpoint as a lightweight probe
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/statistics/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200 ? 'ADMIN' : 'USER';
    } catch {
      return 'USER';
    }
  },
};

// Profile API
export const profileApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    return fetchApi<User>('/api/v1/profile');
  },
  
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    return fetchApi<User>('/api/v1/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Address API
export const addressApi = {
  getAll: async (): Promise<ApiResponse<Address[]>> => {
    return fetchApi<Address[]>('/api/v1/addresses');
  },
  
  getById: async (id: number): Promise<ApiResponse<Address>> => {
    return fetchApi<Address>(`/api/v1/addresses/${id}`);
  },

  create: async (data: AddressRequest): Promise<ApiResponse<Address>> => {
    return fetchApi<Address>('/api/v1/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<AddressRequest>): Promise<ApiResponse<Address>> => {
    return fetchApi<Address>(`/api/v1/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  setDefault: async (id: number): Promise<ApiResponse<Address>> => {
    return fetchApi<Address>(`/api/v1/addresses/${id}/default`, {
      method: 'PUT',
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return fetchApi<null>(`/api/v1/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    return fetchApi<Category[]>('/api/v1/categories');
  },

  getById: async (id: number): Promise<ApiResponse<Category>> => {
    return fetchApi<Category>(`/api/v1/categories/${id}`);
  },

  // Admin CRUD
  create: async (data: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    return fetchApi<Category>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: { name?: string; description?: string }): Promise<ApiResponse<Category>> => {
    return fetchApi<Category>(`/api/v1/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/v1/categories/${id}`, {
      method: 'DELETE',
    }) as unknown as void;
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: ProductSearchParams): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/v1/products?${queryString}` : '/api/v1/products';
    
    return fetchApi<PaginatedResponse<Product>>(endpoint);
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    return fetchApi<Product>(`/api/v1/products/${id}`);
  },

  // Admin CRUD
  create: async (data: {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    categoryId: number;
  }): Promise<ApiResponse<Product>> => {
    return fetchApi<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    name?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    imageUrl?: string;
    isActive?: boolean;
    categoryId?: number;
  }): Promise<ApiResponse<Product>> => {
    return fetchApi<Product>(`/api/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/v1/products/${id}`, {
      method: 'DELETE',
    }) as unknown as void;
  },

  toggleLike: async (id: number): Promise<ApiResponse<{ liked: boolean }>> => {
    return fetchApi<{ liked: boolean }>(`/api/v1/products/${id}/like`, {
      method: 'POST',
    });
  },

  getLiked: async (): Promise<ApiResponse<Product[]>> => {
    return fetchApi<Product[]>('/api/v1/products/liked');
  },
};

// Cart API
export const cartApi = {
  get: async (): Promise<ApiResponse<Cart>> => {
    return fetchApi<Cart>('/api/v1/carts');
  },

  addItem: async (productId: number, quantity: number = 1): Promise<ApiResponse<void>> => {
    return fetchApi<void>('/api/v1/carts/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateQuantity: async (productId: number, quantity: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>('/api/v1/carts/item', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  removeItem: async (productId: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/api/v1/carts/item/${productId}`, {
      method: 'DELETE',
    });
  },

  clear: async (): Promise<ApiResponse<void>> => {
    return fetchApi<void>('/api/v1/carts/clear', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersApi = {
  checkout: async (data: CheckoutRequest): Promise<ApiResponse<Order>> => {
    return fetchApi<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyOrders: async (params?: { page?: number; size?: number; status?: string }): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/v1/orders?${queryString}` : '/api/v1/orders';
    return fetchApi<PaginatedResponse<Order>>(endpoint);
  },

  getById: async (id: number): Promise<ApiResponse<Order>> => {
    return fetchApi<Order>(`/api/v1/orders/${id}`);
  },

  cancel: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/api/v1/orders/cancel/${id}`, {
      method: 'PUT',
    });
  },

  // Admin endpoints
  getAll: async (params?: { page?: number; size?: number; status?: string }): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/v1/admin/orders?${queryString}` : '/api/v1/admin/orders';
    return fetchApi<PaginatedResponse<Order>>(endpoint);
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<Order>> => {
    return fetchApi<Order>(`/api/v1/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus: status }),
    });
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: { page?: number; size?: number }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) searchParams.append('page', String(params.page));
      if (params.size !== undefined) searchParams.append('size', String(params.size));
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/v1/users?${queryString}` : '/api/v1/users';
    return fetchApi<PaginatedResponse<User>>(endpoint);
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    return fetchApi<User>(`/api/v1/users/${id}`);
  },

  create: async (data: UserRequest & { password: string }): Promise<ApiResponse<User>> => {
    return fetchApi<User>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: UserRequest): Promise<ApiResponse<User>> => {
    return fetchApi<User>(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Coupons API
export const couponsApi = {
  getAll: async (params?: { page?: number; size?: number }): Promise<ApiResponse<PaginatedResponse<Coupon>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/v1/coupons?${queryString}` : '/api/v1/coupons';
    return fetchApi<PaginatedResponse<Coupon>>(endpoint);
  },

  getById: async (id: number): Promise<ApiResponse<Coupon>> => {
    return fetchApi<Coupon>(`/api/v1/coupons/${id}`);
  },

  create: async (data: CouponRequest): Promise<ApiResponse<Coupon>> => {
    return fetchApi<Coupon>('/api/v1/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CouponRequest>): Promise<ApiResponse<Coupon>> => {
    return fetchApi<Coupon>(`/api/v1/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/api/v1/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  changeStatus: async (id: number, active: boolean): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/api/v1/coupons/${id}/status?active=${active}`, {
      method: 'PATCH',
    });
  },

  calculateDiscount: async (code: string, amount: number): Promise<ApiResponse<number>> => {
    return fetchApi<number>(`/api/v1/coupons/calculate?code=${encodeURIComponent(code)}&amount=${amount}`);
  },
};

// AI Chat API
export const aiApi = {
  chat: async (message: string): Promise<ApiResponse<any>> => {
    return fetchApi(`/api/v1/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Note: Streaming responses usually require special handling beyond our standard fetch wrapper
  // since they return ReadableStreams rather than pure JSON Promises. 
  // We'll expose the endpoint here to align with the Postman collection.
  chatStreamEndpoint: (message: string) => `/api/v1/ai/chat/stream?message=${encodeURIComponent(message)}`,
};

// Media API
export const mediaApi = {
  upload: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },
};

// Reviews API
export const reviewsApi = {
  // Public - Lấy review của một sản phẩm
  getByProduct: async (
    productId: number, 
    params?: { rating?: number; page?: number; size?: number; sort?: string }
  ): Promise<ApiResponse<ReviewResponse>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.rating) searchParams.append('rating', String(params.rating));
      if (params.page !== undefined) searchParams.append('page', String(params.page));
      if (params.size !== undefined) searchParams.append('size', String(params.size));
      if (params.sort) searchParams.append('sort', params.sort);
    }
    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `/api/v1/products/${productId}/reviews?${queryString}` 
      : `/api/v1/products/${productId}/reviews`;
    
    return fetchApi<ReviewResponse>(endpoint);
  },

  // Auth - Tạo review mới
  create: async (data: ReviewRequest): Promise<ApiResponse<Review>> => {
    return fetchApi<Review>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin/Seller - Trả lời review
  replyAsSeller: async (reviewId: number, reply: string): Promise<ApiResponse<Review>> => {
    return fetchApi<Review>(`/api/v1/seller/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  },

  // Auth - Lấy DS order item có thể review
  getReviewableOrders: async (): Promise<ApiResponse<ReviewableOrder[]>> => {
    return fetchApi<ReviewableOrder[]>('/api/v1/users/me/reviewable-orders');
  },

  // Admin - Lấy danh sách review cần duyệt
  getAdminReviews: async (params?: { 
    productId?: number; 
    userId?: number; 
    status?: string; 
    minReportCount?: number;
    page?: number; 
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `/api/v1/admin/reviews?${queryString}` 
      : `/api/v1/admin/reviews`;
    
    return fetchApi<PaginatedResponse<Review>>(endpoint);
  },

  // Admin - Duyệt/Từ chối review
  updateStatus: async (reviewId: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string | null): Promise<ApiResponse<Review>> => {
    return fetchApi<Review>(`/api/v1/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason: rejectionReason || null }),
    });
  },
};

// Statistics API
export const statisticsApi = {
  getOverview: async (startDate?: string, endDate?: string, status?: string): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
  }>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/api/v1/admin/statistics/overview?${queryString}` 
      : '/api/v1/admin/statistics/overview';
    
    return fetchApi(endpoint);
  },

  getRevenueByDate: async (startDate?: string, endDate?: string): Promise<ApiResponse<RevenueData[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/api/v1/admin/statistics/revenue-by-date?${queryString}` 
      : '/api/v1/admin/statistics/revenue-by-date';
    
    return fetchApi<RevenueData[]>(endpoint);
  },

  getTopProducts: async (startDate?: string, endDate?: string, limit?: number): Promise<ApiResponse<TopProduct[]>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', String(limit));
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/api/v1/admin/statistics/top-products?${queryString}` 
      : '/api/v1/admin/statistics/top-products';
    
    return fetchApi<TopProduct[]>(endpoint);
  },
};
