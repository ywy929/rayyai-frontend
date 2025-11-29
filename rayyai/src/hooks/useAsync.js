import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Generic async data fetching hook
 * Handles loading, error states, and data management
 */
export function useAsync(asyncFn, options = {}) {
  const {
    immediate = false,
    initialData = null,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState({
    data: initialData,
    loading: immediate,
    error: null,
  });

  const mountedRef = useRef(true);
  const asyncFnRef = useRef(asyncFn);

  // Keep asyncFn ref updated
  useEffect(() => {
    asyncFnRef.current = asyncFn;
  }, [asyncFn]);

  const execute = useCallback(async (...args) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFnRef.current(...args);

      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false, error: err }));
        onError?.(err);
      }
      throw err;
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  const setData = useCallback((data) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  // Run immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    isIdle: !state.loading && !state.error && state.data === initialData,
    isSuccess: !state.loading && !state.error && state.data !== initialData,
    isError: !state.loading && state.error !== null,
  };
}

/**
 * Hook for fetching data on mount with automatic refetch capability
 */
export function useFetch(asyncFn, deps = [], options = {}) {
  const { data, loading, error, execute, reset, setData } = useAsync(asyncFn, {
    ...options,
    immediate: false,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, ...deps]);

  return { data, loading, error, refetch, reset, setData };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation(mutationFn, options = {}) {
  const { onSuccess, onError, invalidate } = options;

  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  const mutate = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await mutationFn(...args);

      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        invalidate?.();
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err });
        onError?.(err);
      }
      throw err;
    }
  }, [mutationFn, onSuccess, onError, invalidate]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    mutate,
    reset,
    isIdle: !state.loading && !state.error && state.data === null,
    isSuccess: !state.loading && !state.error && state.data !== null,
    isError: !state.loading && state.error !== null,
  };
}

export default useAsync;
