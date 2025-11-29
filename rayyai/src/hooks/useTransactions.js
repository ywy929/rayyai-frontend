import { useCallback } from 'react';
import { useFetch, useMutation } from './useAsync';
import { transactionApi, incomeApi, expenseApi, transferApi } from '@/services/api';

/**
 * Hook for fetching unified transactions
 */
export function useTransactions(params = {}, options = {}) {
  const fetchTransactions = useCallback(
    () => transactionApi.getAll(params),
    [JSON.stringify(params)]
  );

  return useFetch(fetchTransactions, [JSON.stringify(params)], options);
}

/**
 * Hook for fetching a single transaction
 */
export function useTransaction(type, id, options = {}) {
  const fetchTransaction = useCallback(() => {
    if (!id) return Promise.resolve(null);
    return transactionApi.getById(type, id);
  }, [type, id]);

  return useFetch(fetchTransaction, [type, id], {
    ...options,
    immediate: !!id,
  });
}

/**
 * Hook for transaction mutations (create, update, delete)
 */
export function useTransactionMutations(options = {}) {
  const { onSuccess, invalidate } = options;

  const createIncome = useMutation(
    (data) => incomeApi.create(data),
    { onSuccess, invalidate }
  );

  const createExpense = useMutation(
    (data) => expenseApi.create(data),
    { onSuccess, invalidate }
  );

  const createTransfer = useMutation(
    (data) => transferApi.create(data),
    { onSuccess, invalidate }
  );

  const updateIncome = useMutation(
    ({ id, data }) => incomeApi.update(id, data),
    { onSuccess, invalidate }
  );

  const updateExpense = useMutation(
    ({ id, data }) => expenseApi.update(id, data),
    { onSuccess, invalidate }
  );

  const updateTransfer = useMutation(
    ({ id, data }) => transferApi.update(id, data),
    { onSuccess, invalidate }
  );

  const deleteIncome = useMutation(
    (id) => incomeApi.delete(id),
    { onSuccess, invalidate }
  );

  const deleteExpense = useMutation(
    (id) => expenseApi.delete(id),
    { onSuccess, invalidate }
  );

  const deleteTransfer = useMutation(
    (id) => transferApi.delete(id),
    { onSuccess, invalidate }
  );

  return {
    createIncome,
    createExpense,
    createTransfer,
    updateIncome,
    updateExpense,
    updateTransfer,
    deleteIncome,
    deleteExpense,
    deleteTransfer,
  };
}

/**
 * Hook for income-specific operations
 */
export function useIncomes(params = {}, options = {}) {
  const fetchIncomes = useCallback(
    () => incomeApi.getAll(params),
    [JSON.stringify(params)]
  );

  return useFetch(fetchIncomes, [JSON.stringify(params)], options);
}

/**
 * Hook for expense-specific operations
 */
export function useExpenses(params = {}, options = {}) {
  const fetchExpenses = useCallback(
    () => expenseApi.getAll(params),
    [JSON.stringify(params)]
  );

  return useFetch(fetchExpenses, [JSON.stringify(params)], options);
}

/**
 * Hook for transfer-specific operations
 */
export function useTransfers(params = {}, options = {}) {
  const fetchTransfers = useCallback(
    () => transferApi.getAll(params),
    [JSON.stringify(params)]
  );

  return useFetch(fetchTransfers, [JSON.stringify(params)], options);
}

export default useTransactions;
