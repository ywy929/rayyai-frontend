/**
 * Budget API Service
 */
import { api } from './client';

export const budgetApi = {
  /**
   * Get all budgets
   * @returns {Promise<Array>} Budget list
   */
  getAll: async () => {
    const response = await api.get('/budgets');
    return response.budgets || [];
  },

  /**
   * Get budget details with real spending calculations
   * @param {number} budgetId - Budget ID
   * @returns {Promise<object>} Budget details with spending data
   */
  getDetails: (budgetId) => api.get(`/budgets/${budgetId}/details`),

  /**
   * Get a specific budget by ID
   * @param {number} budgetId - Budget ID
   * @returns {Promise<object>} Budget data
   */
  getById: (budgetId) => api.get(`/budgets/${budgetId}`),

  /**
   * Create a new budget
   * @param {object} budgetData - Budget data
   * @returns {Promise<object>} Created budget
   */
  create: (budgetData) => api.post('/budgets/', budgetData),

  /**
   * Update a budget
   * @param {number} budgetId - Budget ID
   * @param {object} budgetData - Updated budget data
   * @returns {Promise<object>} Updated budget
   */
  update: (budgetId, budgetData) => api.put(`/budgets/${budgetId}`, budgetData),

  /**
   * Delete a budget
   * @param {number} budgetId - Budget ID
   * @returns {Promise<void>}
   */
  delete: (budgetId) => api.delete(`/budgets/${budgetId}`),
};

export default budgetApi;
