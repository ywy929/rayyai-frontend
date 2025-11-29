/**
 * Credit Cards API Service
 */
import { api } from './client';

export const cardsApi = {
  /**
   * Get all credit cards
   * @returns {Promise<Array>} List of cards
   */
  getAll: () => api.get('/cards/'),

  /**
   * Get aggregated credit card overview metrics
   * @returns {Promise<object>} Overview data
   */
  getOverview: () => api.get('/cards/overview'),

  /**
   * Get a specific card by ID
   * @param {number} cardId - Card ID
   * @returns {Promise<object>} Card data
   */
  getById: (cardId) => api.get(`/cards/${cardId}`),

  /**
   * Create a new card
   * @param {object} cardData - Card data
   * @returns {Promise<object>} Created card
   */
  create: (cardData) => api.post('/cards/', cardData),

  /**
   * Update a card
   * @param {number} cardId - Card ID
   * @param {object} cardData - Updated card data
   * @returns {Promise<object>} Updated card
   */
  update: (cardId, cardData) => api.put(`/cards/${cardId}`, cardData),

  /**
   * Delete a card
   * @param {number} cardId - Card ID
   * @returns {Promise<void>}
   */
  delete: (cardId) => api.delete(`/cards/${cardId}`),

  /**
   * Get terms history for a specific card
   * @param {number} cardId - Card ID
   * @returns {Promise<Array>} List of history records
   */
  getHistory: (cardId) => api.get(`/cards/${cardId}/history`),

  /**
   * Get AI-powered credit card recommendations
   * @param {number} maxResults - Maximum number of recommendations (default: 5, max: 10)
   * @returns {Promise<object>} Recommendations with match scores and reasoning
   */
  getRecommendations: (maxResults = 5) => {
    const queryParams = new URLSearchParams();
    if (maxResults !== 5) queryParams.append('max_results', maxResults);
    const queryString = queryParams.toString();
    return api.get(`/cards/recommendations/ai${queryString ? `?${queryString}` : ''}`);
  },
};

export default cardsApi;
