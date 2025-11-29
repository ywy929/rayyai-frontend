/**
 * Core API Client
 * Base HTTP client with authentication and error handling using Axios
 */
import axios from 'axios';

// Detect environment and set API base URL accordingly
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168');

// API URLs for different environments
const API_URLS = {
  local: 'http://localhost:8000',
  production: 'https://rayyai-api-service-838873798405.us-central1.run.app'
};

// Auto-select API URL based on environment
export const API_BASE_URL = isDevelopment ? API_URLS.local : API_URLS.production;

// Log current API configuration for debugging
console.log(`🌐 API Mode: ${isDevelopment ? 'Local Development' : 'Production'}`);
console.log(`📡 API Base URL: ${API_BASE_URL}`);

// ===========================
// Token Management
// ===========================

export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const isAuthenticated = () => !!getToken();

// ===========================
// Custom Error Class
// ===========================

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ===========================
// Axios Instance
// ===========================

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      const message = data?.detail || data?.message || data || 'An error occurred';
      throw new ApiError(message, status, data);
    }
    if (error.request) {
      throw new ApiError('Network error occurred', 0, null);
    }
    throw new ApiError(error.message || 'An error occurred', 0, null);
  }
);

// ===========================
// HTTP Request Function (for backwards compatibility)
// ===========================

export const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const config = {
    url: endpoint,
    method,
    headers,
    ...rest,
  };

  if (body) {
    config.data = typeof body === 'string' ? JSON.parse(body) : body;
  }

  return axiosInstance.request(config);
};

// ===========================
// HTTP Method Helpers
// ===========================

export const api = {
  get: (endpoint, options = {}) => axiosInstance.get(endpoint, options),

  post: (endpoint, data, options = {}) => axiosInstance.post(endpoint, data, options),

  put: (endpoint, data, options = {}) => axiosInstance.put(endpoint, data, options),

  delete: (endpoint, options = {}) => axiosInstance.delete(endpoint, options),

  patch: (endpoint, data, options = {}) => axiosInstance.patch(endpoint, data, options),
};

// Export axios instance for direct use (e.g., FormData uploads)
export { axiosInstance };

export default api;
