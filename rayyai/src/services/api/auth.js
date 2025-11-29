/**
 * Authentication API Service
 */
import { api, setToken, removeToken } from './client';

export const authApi = {
  /**
   * Login user
   * @param {object} credentials - Email and password
   * @returns {Promise<object>} User data and token
   */
  login: async (credentials) => {
    const response = await api.post('/users/login', {
      email: credentials.email || credentials.username,
      password: credentials.password,
    });

    if (response.access_token) {
      setToken(response.access_token);
    }

    return response;
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} Created user data
   */
  register: (userData) => api.post('/users/', userData),

  /**
   * Logout user (clears token)
   */
  logout: () => {
    removeToken();
  },

  /**
   * Get current user profile
   * @returns {Promise<object>} User profile data
   */
  getCurrentUser: () => api.get('/users'),

  /**
   * Update current user profile
   * @param {object} updates - Profile updates
   * @returns {Promise<object>} Updated user profile
   */
  updateProfile: (updates) => api.put('/users', updates),
};

export default authApi;
