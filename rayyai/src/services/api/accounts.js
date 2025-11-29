/**
 * Account API Service
 */
import { api } from './client';

export const accountApi = {
  /**
   * Get all accounts for the current user
   * @returns {Promise<Array>} List of accounts
   */
  getAll: () => api.get('/accounts/'),

  /**
   * Get a specific account by ID
   * @param {number} accountId - Account ID
   * @returns {Promise<object>} Account data
   */
  getById: (accountId) => api.get(`/accounts/${accountId}`),

  /**
   * Create a new account
   * @param {object} accountData - Account data
   * @returns {Promise<object>} Created account
   */
  create: (accountData) => api.post('/accounts/', accountData),

  /**
   * Update an account
   * @param {number} accountId - Account ID
   * @param {object} accountData - Updated account data
   * @returns {Promise<object>} Updated account
   */
  update: (accountId, accountData) => api.put(`/accounts/${accountId}`, accountData),

  /**
   * Delete an account
   * @param {number} accountId - Account ID
   * @returns {Promise<void>}
   */
  delete: (accountId) => api.delete(`/accounts/${accountId}`),
};

export default accountApi;
