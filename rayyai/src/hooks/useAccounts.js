import { useCallback } from 'react';
import { useFetch, useMutation } from './useAsync';
import { accountApi } from '@/services/api';

/**
 * Hook for fetching all accounts
 */
export function useAccounts(options = {}) {
  const fetchAccounts = useCallback(() => accountApi.getAll(), []);

  return useFetch(fetchAccounts, [], options);
}

/**
 * Hook for fetching a single account
 */
export function useAccount(accountId, options = {}) {
  const fetchAccount = useCallback(() => {
    if (!accountId) return Promise.resolve(null);
    return accountApi.getById(accountId);
  }, [accountId]);

  return useFetch(fetchAccount, [accountId], {
    ...options,
    immediate: !!accountId,
  });
}

/**
 * Hook for account mutations (create, update, delete)
 */
export function useAccountMutations(options = {}) {
  const { onSuccess, invalidate } = options;

  const createAccount = useMutation(
    (data) => accountApi.create(data),
    { onSuccess, invalidate }
  );

  const updateAccount = useMutation(
    ({ id, data }) => accountApi.update(id, data),
    { onSuccess, invalidate }
  );

  const deleteAccount = useMutation(
    (id) => accountApi.delete(id),
    { onSuccess, invalidate }
  );

  return {
    createAccount,
    updateAccount,
    deleteAccount,
  };
}

export default useAccounts;
