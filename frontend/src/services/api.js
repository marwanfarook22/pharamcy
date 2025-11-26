import axios from 'axios';

// Use proxy in development, or absolute URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login/register pages
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        error.message = 'Cannot connect to server. Please ensure the backend API is running.';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Medicines API
export const medicinesAPI = {
  getAll: (categoryId, search) => 
    api.get('/medicines', { 
      params: { 
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { search } : {})
      } 
    }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  getOutOfStock: () => api.get('/medicines/out-of-stock'),
  getLowStock: (threshold) => api.get('/medicines/low-stock', { params: threshold ? { threshold } : {} }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Brands API
export const brandsAPI = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  getAll: (status) => 
    api.get('/orders', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Payments API
export const paymentsAPI = {
  getAll: (orderId) => 
    api.get('/payments', { params: orderId ? { orderId } : {} }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
};

// Batches API
export const batchesAPI = {
  getAll: (medicineId) => 
    api.get('/batches', { params: medicineId ? { medicineId } : {} }),
  getById: (id) => api.get(`/batches/${id}`),
  getFEFO: (medicineId) => api.get(`/batches/fefo/${medicineId}`),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
  incrementQuantity: (id, data) => api.patch(`/batches/${id}/increment-quantity`, data),
  incrementQuantityByMedicine: (medicineId, data) => api.patch(`/batches/medicine/${medicineId}/increment-quantity`, data),
};

// Expiry Alerts API
export const expiryAlertsAPI = {
  getAll: (unresolvedOnly) => 
    api.get('/expiryalerts', { 
      params: unresolvedOnly ? { unresolvedOnly: true } : {} 
    }),
  getById: (id) => api.get(`/expiryalerts/${id}`),
  resolve: (id, data) => api.put(`/expiryalerts/${id}/resolve`, data),
  checkAll: () => api.post('/expiryalerts/check-all'),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Users API
export const usersAPI = {
  getAll: (role, search) => 
    api.get('/users', { 
      params: { 
        ...(role ? { role } : {}), 
        ...(search ? { search } : {}) 
      } 
    }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  getBestCustomers: (limit) => api.get('/users/best-customers', { params: limit ? { limit } : {} }),
};

// Bills API
export const billsAPI = {
  getAll: (orderId) => 
    api.get('/bills', { params: orderId ? { orderId } : {} }),
  getById: (id) => api.get(`/bills/${id}`),
  getByOrderId: (orderId) => api.get(`/bills/order/${orderId}`),
};

// Supplier Return Requests API
export const supplierReturnRequestsAPI = {
  getAll: (status) => 
    api.get('/supplierreturnrequests', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/supplierreturnrequests/${id}`),
  create: (data) => api.post('/supplierreturnrequests', data),
  approve: (id, data) => api.put(`/supplierreturnrequests/${id}/approve`, data),
  reject: (id, data) => api.put(`/supplierreturnrequests/${id}/reject`, data),
  getBySupplier: (supplierId, status) => 
    api.get(`/supplierreturnrequests/by-supplier/${supplierId}`, { params: status ? { status } : {} }),
};

// Banner Images API
export const bannerImagesAPI = {
  getAll: (activeOnly) => 
    api.get('/bannerimages', { params: activeOnly ? { activeOnly: true } : {} }),
  getById: (id) => api.get(`/bannerimages/${id}`),
  create: (data) => api.post('/bannerimages', data),
  update: (id, data) => api.put(`/bannerimages/${id}`, data),
  delete: (id) => api.delete(`/bannerimages/${id}`),
  toggleStatus: (id) => api.patch(`/bannerimages/${id}/toggle-status`),
};

// Refund Requests API
export const refundRequestsAPI = {
  getAll: (status) => 
    api.get('/refundrequests', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/refundrequests/${id}`),
  create: (data) => api.post('/refundrequests', data),
  approve: (id, data) => api.put(`/refundrequests/${id}/approve`, data),
  reject: (id, data) => api.put(`/refundrequests/${id}/reject`, data),
  updateStatus: (id, data) => api.put(`/refundrequests/${id}/status`, data),
  getByUser: (userId, status) => 
    api.get(`/refundrequests/by-user/${userId}`, { params: status ? { status } : {} }),
  getByOrder: (orderId) => api.get(`/refundrequests/by-order/${orderId}`),
};

// Messages API
export const messagesAPI = {
  getMyMessages: (unreadOnly) => 
    api.get('/messages/my-messages', { params: unreadOnly ? { unreadOnly: true } : {} }),
  getById: (id) => api.get(`/messages/${id}`),
  markAsRead: (id, isRead = true) => 
    api.put(`/messages/${id}/read`, { isRead }),
  getUnreadCount: () => api.get('/messages/unread-count'),
  // Admin endpoints
  getAll: (userId, unreadOnly) => 
    api.get('/messages', { 
      params: { 
        ...(userId ? { userId } : {}),
        ...(unreadOnly ? { unreadOnly: true } : {})
      } 
    }),
  sendMessage: (data) => api.post('/messages', data),
  sendToMultiple: (data) => api.post('/messages/send-to-multiple', data),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Coupons API
export const couponsAPI = {
  getAll: (activeOnly) => 
    api.get('/coupons', { params: activeOnly ? { activeOnly: true } : {} }),
  getActive: () => api.get('/coupons/active'),
  getById: (id) => api.get(`/coupons/${id}`),
  validate: (code, orderAmount) => 
    api.post('/coupons/validate', { code, orderAmount }),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  toggleStatus: (id) => api.patch(`/coupons/${id}/toggle-status`),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// Comments API
export const commentsAPI = {
  getAll: (medicineId) => 
    api.get('/comments', { params: medicineId ? { medicineId } : {} }),
  getById: (id) => api.get(`/comments/${id}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export default api;


