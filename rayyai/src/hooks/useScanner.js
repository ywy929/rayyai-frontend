import { useMutation } from './useAsync';
import { scannerApi } from '@/services/api';

/**
 * Hook for receipt scanning mutations
 */
export function useScanner(options = {}) {
  const { onSuccess, onError } = options;

  const scanReceipt = useMutation(
    (imageFile) => scannerApi.scanReceipt(imageFile),
    { onSuccess, onError }
  );

  return {
    scanReceipt,
    scanning: scanReceipt.loading,
    scannedData: scanReceipt.data,
    scanError: scanReceipt.error,
    reset: scanReceipt.reset,
  };
}

export default useScanner;
