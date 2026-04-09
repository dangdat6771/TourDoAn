import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8081/api/v1'
  : '/api/v1';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Tours
  tours: {
    getPublic: () => apiClient.get('/tours'),
    getDetail: (slug: string) => apiClient.get(`/tours/${slug}`),
    search: (params: any) => apiClient.get('/tours/search', { params }),
    getRelated: (tourId: number) => apiClient.get(`/tours/related?tourId=${tourId}`),
    calculatePrice: (data: any) => apiClient.post('/tours/calculate-price', data),
  },
  
  // Categories
  categories: {
    getAll: (page?: number, pageSize?: number) => 
      apiClient.get('/category/', { params: { page, pageSize } }),
    getActive: () => apiClient.get('/category/active'),
    getById: (id: number) => apiClient.get(`/category/${id}`),
    create: (data: any) => apiClient.post('/category/', data),
    update: (id: number, data: any) => apiClient.put(`/category/${id}`, data),
    delete: (id: number) => apiClient.delete(`/category/${id}`),
    changeStatus: (id: number, status: string) => 
      apiClient.patch(`/category/${id}/status`, null, { params: { status } }),
  },
  
  // Orders
  orders: {
    getAll: (page?: number, pageSize?: number) => 
      apiClient.get('/order/', { params: { page, pageSize } }),
    getById: (id: number) => apiClient.get(`/order/${id}`),
    create: (data: any) => apiClient.post('/order/', data),
    update: (id: number, data: any) => apiClient.put(`/order/${id}`, data),
    delete: (id: number) => apiClient.delete(`/order/${id}`),
    changeStatus: (id: number, status: string) => 
      apiClient.patch(`/order/${id}/status`, null, { params: { status } }),
  },
  
  // Reviews
  reviews: {
    getAll: (page?: number, pageSize?: number) => 
      apiClient.get('/review/', { params: { page, pageSize } }),
    getById: (id: number) => apiClient.get(`/review/${id}`),
    create: (data: any) => apiClient.post('/review/', data),
    update: (id: number, data: any) => apiClient.put(`/review/${id}`, data),
    delete: (id: number) => apiClient.delete(`/review/${id}`),
    changeStatus: (id: number, status: string) => 
      apiClient.patch(`/review/${id}/status`, null, { params: { status } }),
  },
  
  // Users
  users: {
    register: (data: any) => apiClient.post('/user/register', data),
    login: (data: any) => apiClient.post('/user/login', data),
    getAll: (page?: number, pageSize?: number) => 
      apiClient.get('/user/', { params: { page, pageSize } }),
    getById: (id: number) => apiClient.get(`/user/${id}`),
    update: (id: number, data: any) => apiClient.patch(`/user/update/${id}`, data),
    delete: (id: number) => apiClient.delete(`/user/delete/${id}`),
    changeStatus: (id: number, status: string) => 
      apiClient.put(`/user/${id}/status`, { status }),
    resetPassword: (id: number, data: any) => 
      apiClient.put(`/user/reset-password/${id}`, data),
  },
};

export default apiClient;
