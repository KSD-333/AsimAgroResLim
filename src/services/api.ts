import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const { auth } = await import('../firebase');
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Product APIs
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  search: (query: string) => api.get(`/products/search?q=${query}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Order APIs
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getUserOrders: () => api.get('/orders/user/me'),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string, notes?: string) => 
    api.patch(`/orders/${id}/status`, { status, adminNotes: notes }),
  updateDeliveryDate: (id: string, date: Date) => 
    api.patch(`/orders/${id}/delivery-date`, { estimatedDeliveryDate: date }),
  cancel: (id: string, reason: string) => 
    api.post(`/orders/${id}/cancel`, { reason }),
};

// Review APIs
export const reviewAPI = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (data: any) => api.post('/reviews', data),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  markHelpful: (id: string) => api.post(`/reviews/${id}/helpful`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (item: any) => api.post('/cart/items', item),
  updateItem: (productId: string, quantity: number) => 
    api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateShippingAddress: (address: any) => api.put('/users/shipping-address', address),
  getAllUsers: () => api.get('/users'),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Contact Form APIs
export const contactAPI = {
  submit: (data: any) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  updateStatus: (id: string, status: string) => 
    api.patch(`/contact/${id}/status`, { status }),
  respond: (id: string, response: string) => 
    api.post(`/contact/${id}/respond`, { response }),
};

// Order Message APIs
export const messageAPI = {
  getAll: () => api.get('/messages'),
  getByOrder: (orderId: string) => api.get(`/messages/order/${orderId}`),
  getUserMessages: () => api.get('/messages/user/me'),
  create: (data: any) => api.post('/messages', data),
  updateStatus: (id: string, status: string) => 
    api.patch(`/messages/${id}/status`, { status }),
  respond: (id: string, response: string) => 
    api.post(`/messages/${id}/respond`, { response }),
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data: any) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  updateStatus: (id: string, status: string) => 
    api.patch(`/feedback/${id}/status`, { status }),
};

// Image upload API
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};

export default api;
