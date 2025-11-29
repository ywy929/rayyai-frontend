/**
 * Scanner API Service
 * Handles receipt scanning and document processing
 */
import { axiosInstance, ApiError } from './client';

export const scannerApi = {
  /**
   * Scan a receipt image and extract transaction details using AI
   * @param {File} imageFile - The receipt image file
   * @returns {Promise<object>} Extracted transaction data
   */
  scanReceipt: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axiosInstance.post('/scanner/scan-receipt', formData, {
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
};

export default scannerApi;
