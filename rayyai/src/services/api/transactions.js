/**
 * Transaction API Services
 * Handles income, expenses, transfers, and unified transactions
 */
import { api, API_BASE_URL, getToken, ApiError } from './client';
import { accountApi } from './accounts';
import {
  mergeTransactions,
  createAccountsMap,
  parseTransactionId,
  mapTransactionToIncome,
  mapTransactionToExpense,
  mapTransactionToTransfer
} from '../../utils/transactionMapper';

// ===========================
// Income API
// ===========================

export const incomeApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    const queryString = queryParams.toString();
    return api.get(`/transactions/income${queryString ? `?${queryString}` : ''}`);
  },

  getById: (incomeId) => api.get(`/transactions/income/${incomeId}`),
  create: (incomeData) => api.post('/transactions/income', incomeData),
  update: (incomeId, incomeData) => api.put(`/transactions/income/${incomeId}`, incomeData),
  delete: (incomeId) => api.delete(`/transactions/income/${incomeId}`),
};

// ===========================
// Expense API
// ===========================

export const expenseApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.expense_type) queryParams.append('expense_type', params.expense_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.min_amount !== undefined) queryParams.append('min_amount', params.min_amount);
    if (params.max_amount !== undefined) queryParams.append('max_amount', params.max_amount);
    const queryString = queryParams.toString();
    return api.get(`/transactions/expense${queryString ? `?${queryString}` : ''}`);
  },

  getById: (expenseId) => api.get(`/transactions/expense/${expenseId}`),
  create: (expenseData) => api.post('/transactions/expense', expenseData),
  update: (expenseId, expenseData) => api.put(`/transactions/expense/${expenseId}`, expenseData),
  delete: (expenseId) => api.delete(`/transactions/expense/${expenseId}`),
};

// ===========================
// Transfer API
// ===========================

export const transferApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.transfer_type) queryParams.append('transfer_type', params.transfer_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    const queryString = queryParams.toString();
    return api.get(`/transactions/transfer${queryString ? `?${queryString}` : ''}`);
  },

  getById: (transferId) => api.get(`/transactions/transfer/${transferId}`),
  create: (transferData) => api.post('/transactions/transfer', transferData),
  update: (transferId, transferData) => api.put(`/transactions/transfer/${transferId}`, transferData),
  delete: (transferId) => api.delete(`/transactions/transfer/${transferId}`),
};

// ===========================
// Unified Transaction API
// ===========================

export const transactionApi = {
  /**
   * Get all transactions (income + expenses + transfers) in a unified format
   */
  getAll: async (params = {}, includeAccounts = true) => {
    try {
      const promises = [
        incomeApi.getAll(params),
        expenseApi.getAll(params),
        transferApi.getAll(params).catch(err => {
          console.warn('Failed to fetch transfers (table may not exist yet):', err);
          return [];
        }),
      ];

      if (includeAccounts) {
        promises.push(accountApi.getAll());
      }

      const results = await Promise.all(promises);
      const [incomes, expenses, transfers, accounts] = includeAccounts
        ? results
        : [...results, null];

      const accountsMap = includeAccounts && accounts
        ? createAccountsMap(accounts)
        : {};

      return mergeTransactions(incomes, expenses, transfers || [], accountsMap);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Create a new transaction (income, expense, or transfer)
   */
  create: async (transactionData, accountId) => {
    const { type } = transactionData;

    if (type === 'income') {
      const incomePayload = mapTransactionToIncome(transactionData, accountId);
      return await incomeApi.create(incomePayload);
    } else if (type === 'expense') {
      const expensePayload = mapTransactionToExpense(transactionData, accountId);
      return await expenseApi.create(expensePayload);
    } else if (type === 'transfer') {
      const transferPayload = mapTransactionToTransfer(transactionData, accountId);
      return await transferApi.create(transferPayload);
    } else {
      throw new Error(`Invalid transaction type: ${type}`);
    }
  },

  /**
   * Update an existing transaction
   */
  update: async (transactionId, transactionData, accountId) => {
    const { type, rawId } = parseTransactionId(transactionId);

    if (type === 'income') {
      const incomePayload = mapTransactionToIncome(transactionData, accountId);
      return await incomeApi.update(rawId, incomePayload);
    } else if (type === 'expense') {
      const expensePayload = mapTransactionToExpense(transactionData, accountId);
      return await expenseApi.update(rawId, expensePayload);
    } else if (type === 'transfer') {
      const transferPayload = mapTransactionToTransfer(transactionData, accountId);
      return await transferApi.update(rawId, transferPayload);
    } else {
      throw new Error(`Invalid transaction ID format: ${transactionId}`);
    }
  },

  /**
   * Delete a transaction
   */
  delete: async (transactionId) => {
    try {
      const { type, rawId } = parseTransactionId(transactionId);

      if (type === 'income') {
        return await incomeApi.delete(rawId);
      } else if (type === 'expense') {
        return await expenseApi.delete(rawId);
      } else if (type === 'transfer') {
        return await transferApi.delete(rawId);
      } else {
        throw new Error(`Invalid transaction type: ${type}. Transaction ID: ${transactionId}`);
      }
    } catch (error) {
      if (error.message.includes('Invalid transaction ID format')) {
        throw error;
      }
      throw new Error(`Failed to delete transaction ${transactionId}: ${error.message}`);
    }
  },

  /**
   * Delete multiple transactions in bulk
   */
  bulkDelete: async (transactionIds) => {
    const token = getToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401, null);
    }

    const url = `${API_BASE_URL}/transactions/bulk-delete`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction_ids: transactionIds }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Bulk delete failed' }));
      throw new ApiError(error.detail || 'Bulk delete failed', response.status, error);
    }

    return await response.json();
  },

  /**
   * Delete all transactions for the current user
   */
  deleteAll: async () => {
    const token = getToken();
    if (!token) {
      throw new ApiError('No authentication token found', 401, null);
    }

    const url = `${API_BASE_URL}/transactions/delete-all`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete all failed' }));
      throw new ApiError(error.detail || 'Delete all failed', response.status, error);
    }

    return await response.json();
  },
};

export default transactionApi;
