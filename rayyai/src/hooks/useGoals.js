import { useCallback } from 'react';
import { useFetch, useMutation } from './useAsync';
import { goalsApi } from '@/services/api';

/**
 * Hook for fetching all financial goals
 */
export function useGoals(options = {}) {
  const fetchGoals = useCallback(() => goalsApi.getAll(), []);

  return useFetch(fetchGoals, [], options);
}

/**
 * Hook for fetching a single goal
 */
export function useGoal(goalId, options = {}) {
  const fetchGoal = useCallback(() => {
    if (!goalId) return Promise.resolve(null);
    return goalsApi.getById(goalId);
  }, [goalId]);

  return useFetch(fetchGoal, [goalId], {
    ...options,
    immediate: !!goalId,
  });
}

/**
 * Hook for goal mutations (create, update, delete, contribute)
 */
export function useGoalMutations(options = {}) {
  const { onSuccess, invalidate } = options;

  const createGoal = useMutation(
    (data) => goalsApi.create(data),
    { onSuccess, invalidate }
  );

  const updateGoal = useMutation(
    ({ id, data }) => goalsApi.update(id, data),
    { onSuccess, invalidate }
  );

  const deleteGoal = useMutation(
    (id) => goalsApi.delete(id),
    { onSuccess, invalidate }
  );

  const contributeToGoal = useMutation(
    ({ id, amount }) => goalsApi.contribute(id, amount),
    { onSuccess, invalidate }
  );

  return {
    createGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
  };
}

export default useGoals;
