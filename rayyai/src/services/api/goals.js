/**
 * Goals API Service
 */
import { api } from './client';

export const goalsApi = {
  /**
   * Get all goals
   * @returns {Promise<Array>} List of goals
   */
  getAll: () => api.get('/goals/'),

  /**
   * Get a specific goal by ID
   * @param {number} goalId - Goal ID
   * @returns {Promise<object>} Goal data
   */
  getById: (goalId) => api.get(`/goals/${goalId}`),

  /**
   * Create a new goal
   * @param {object} goalData - Goal data
   * @returns {Promise<object>} Created goal
   */
  create: (goalData) => api.post('/goals/', goalData),

  /**
   * Update a goal
   * @param {number} goalId - Goal ID
   * @param {object} goalData - Updated goal data
   * @returns {Promise<object>} Updated goal
   */
  update: (goalId, goalData) => api.put(`/goals/${goalId}`, goalData),

  /**
   * Delete a goal
   * @param {number} goalId - Goal ID
   * @returns {Promise<void>}
   */
  delete: (goalId) => api.delete(`/goals/${goalId}`),
};

export default goalsApi;
