import { useToastContext } from '../context/ToastContext';

/**
 * Hook to trigger toast notifications across the application.
 *
 * Usage:
 * const toast = useToast();
 * toast.success("Saved successfully");
 * toast.error("Failed to load records");
 */
export default function useToast() {
  return useToastContext();
}
