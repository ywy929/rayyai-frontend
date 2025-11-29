import { useCallback } from 'react';
import { useFetch, useMutation } from './useAsync';
import { budgetApi } from '@/services/api';

/**
 * Hook for fetching all budgets
 */
export function useBudgets(options = {}) {
  const fetchBudgets = useCallback(() => budgetApi.getAll(), []);

  return useFetch(fetchBudgets, [], options);
}

/**
 * Hook for fetching a single budget
 */
export function useBudget(budgetId, options = {}) {
  const fetchBudget = useCallback(() => {
    if (!budgetId) return Promise.resolve(null);
    return budgetApi.getById(budgetId);
  }, [budgetId]);

  return useFetch(fetchBudget, [budgetId], {
    ...options,
    immediate: !!budgetId,
  });
}

/**
 * Hook for fetching budget overview/summary
 */
export function useBudgetOverview(options = {}) {
  const fetchOverview = useCallback(() => budgetApi.getOverview(), []);

  return useFetch(fetchOverview, [], options);
}

/**
 * Hook for budget mutations (create, update, delete)
 */
export function useBudgetMutations(options = {}) {
  const { onSuccess, invalidate } = options;

  const createBudget = useMutation(
    (data) => budgetApi.create(data),
    { onSuccess, invalidate }
  );

  const updateBudget = useMutation(
    ({ id, data }) => budgetApi.update(id, data),
    { onSuccess, invalidate }
  );

  const deleteBudget = useMutation(
    (id) => budgetApi.delete(id),
    { onSuccess, invalidate }
  );

  return {
    createBudget,
    updateBudget,
    deleteBudget,
  };
}

export default useBudgets;
