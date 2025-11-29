/**
 * Chat API Service
 * Handles conversations and messages with RayyAI
 */
import { api, axiosInstance, ApiError } from './client';

export const chatApi = {
  /**
   * Create a new conversation
   * @param {object} conversationData - Conversation data (optional title)
   * @returns {Promise<object>} Created conversation
   */
  createConversation: (conversationData = {}) => {
    return api.post('/chat/conversations', conversationData);
  },

  /**
   * Get list of conversations
   * @param {object} params - Query parameters (skip, limit)
   * @returns {Promise<object>} List of conversations
   */
  getConversations: (params = {}) => {
    return api.get('/chat/conversations', { params });
  },

  /**
   * Get a specific conversation
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<object>} Conversation details
   */
  getConversation: (conversationId) => {
    return api.get(`/chat/conversations/${conversationId}`);
  },

  /**
   * Delete a conversation
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<void>}
   */
  deleteConversation: (conversationId) => {
    return api.delete(`/chat/conversations/${conversationId}`);
  },

  /**
   * Get messages for a conversation
   * @param {number} conversationId - Conversation ID
   * @param {number} limit - Optional message limit
   * @returns {Promise<Array>} List of messages
   */
  getMessages: (conversationId, limit = null) => {
    const params = {};
    if (limit !== null) params.limit = limit;
    return api.get(`/chat/conversations/${conversationId}/messages`, { params });
  },

  /**
   * Send a message (creates conversation if needed)
   * @param {string} message - Message content
   * @param {File[]} files - Optional array of files to upload
   * @returns {Promise<object>} Response with message, assistant response, and conversation
   */
  sendMessage: async (message, files = []) => {
    const formData = new FormData();
    formData.append('message', message);
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    try {
      const response = await axiosInstance.post('/chat/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error occurred', 0, null);
    }
  },

  /**
   * Send a message to a specific conversation
   * @param {number} conversationId - Conversation ID
   * @param {string} message - Message content
   * @param {File[]} files - Optional array of files to upload
   * @param {object} options - Additional axios options
   * @returns {Promise<object>} Response with message, assistant response, and conversation
   */
  sendMessageToConversation: async (conversationId, message, files = [], options = {}) => {
    const formData = new FormData();
    formData.append('message', message);
    if (files && files.length > 0) {
      console.log(`Appending ${files.length} file(s) to FormData`);
      files.forEach((file, index) => {
        console.log(`  - File ${index}: ${file.name}, type: ${file.type}, size: ${file.size}`);
        formData.append('files', file);
      });
    } else {
      console.log('No files to append to FormData');
    }

    try {
      const response = await axiosInstance.post(
        `/chat/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          ...options,
        }
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error occurred', 0, null);
    }
  },

  /**
   * Update an existing message's content
   * @param {number} messageId - Message ID
   * @param {string} content - Updated content
   * @returns {Promise<object>}
   */
  updateMessage: (messageId, content) => {
    return api.patch(`/chat/messages/${messageId}`, null, {
      params: { content },
    });
  },

  /**
   * Delete a chat message
   * @param {number} messageId - Message ID
   * @returns {Promise<object>}
   */
  deleteMessage: (messageId) => {
    return api.delete(`/chat/messages/${messageId}`);
  },

  /**
   * Refresh user's financial context cache
   * @returns {Promise<object>} Refresh result
   */
  refreshContext: () => {
    return api.post('/chat/context/refresh');
  },

  /**
   * Trigger context summarization
   * @returns {Promise<object>} Summarization result
   */
  summarizeContext: () => {
    return api.post('/chat/context/summarize');
  },

  /**
   * Update conversation title (rename)
   * @param {number} conversationId - Conversation ID
   * @param {string} title - New title
   * @returns {Promise<object>} Updated conversation
   */
  updateConversation: (conversationId, title) => {
    return api.patch(`/chat/conversations/${conversationId}`, null, {
      params: { title },
    });
  },
};

/**
 * RayyAI Insights API
 */
export const rayyaiApi = {
  /**
   * Get AI insights and analysis
   * @param {object} params - Query parameters
   * @returns {Promise<object>} AI analysis data
   */
  getInsights: (params = {}) => {
    return api.get('/rayyai/', { params });
  },
};

export default chatApi;
