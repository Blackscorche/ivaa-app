import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

export const ownerAPI = {
  getShop: async (shopId: number) => {
    const response = await api.get(`/shops/${shopId}`);
    return response.data;
  },
  getContent: async () => {
    const response = await api.get('/content');
    return response.data;
  },
  uploadContent: async (formData: FormData, onProgress?: (p: number) => void) => {
    const response = await api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000,
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return response.data;
  },
  getScreens: async (shopId: number) => {
    const response = await api.get(`/screens/shop/${shopId}`);
    return response.data;
  },
  getBilling: async (shopId: number) => {
    const response = await api.get(`/billing/shops/${shopId}`);
    return response.data;
  },
  getCreditBalance: async () => {
    const response = await api.get('/payment/credit/balance');
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getReferrals: async () => {
    const response = await api.get('/referrals/my');
    return response.data;
  },
  submitReferral: async (data: { friendName: string; friendPhone: string }) => {
    const response = await api.post('/referrals', data);
    return response.data;
  },
  getReferralReward: async () => {
    const response = await api.get('/referrals/reward-amount');
    return response.data;
  },
};

export const adminAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getShops: async () => {
    const response = await api.get('/admin/shops');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getContent: async () => {
    const response = await api.get('/content');
    return response.data;
  },
  getMonitoring: async () => {
    const response = await api.get('/monitoring/screens');
    return response.data;
  },
  getMonitoringStats: async () => {
    const response = await api.get('/monitoring/stats');
    return response.data;
  },
  getReportsAdsPlayed: async (params?: { from?: string; to?: string }) => {
    const response = await api.get('/monitoring/reports/ads-played', { params });
    return response.data;
  },
  getReportsSubscriptions: async () => {
    const response = await api.get('/monitoring/reports/subscriptions');
    return response.data;
  },
  getBilling: async () => {
    const response = await api.get('/billing/all');
    return response.data;
  },
  getInquiries: async () => {
    const response = await api.get('/inquiries');
    return response.data;
  },
  getReferrals: async () => {
    const response = await api.get('/referrals');
    return response.data;
  },
};

export const salesAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getMyShops: async () => {
    const response = await api.get('/sales/my-shops');
    return response.data;
  },
  registerShop: async (data: any) => {
    const response = await api.post('/sales/register-shop', data);
    return response.data;
  },
  getCommissions: async () => {
    const response = await api.get('/sales/commissions');
    return response.data.commissions || [];
  },
};

export default api;
