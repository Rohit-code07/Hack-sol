import { useCallback } from 'react';
import useAsync from './useAsync';
import { getDiscrepancies } from '../services/discrepancyService';

export default function useDiscrepancies(farmerId) {
  const fetchDiscrepancies = useCallback(() => {
    if (!farmerId) return Promise.resolve([]);
    return getDiscrepancies(farmerId);
  }, [farmerId]);

  const { data, loading, error, retry } = useAsync(fetchDiscrepancies, Boolean(farmerId), [farmerId]);

  const list = Array.isArray(data) ? data : [];
  const openDiscrepancies = list.filter((d) => !d.resolved);
  const highSeverityCount = openDiscrepancies.filter((d) => d.severity === 'HIGH').length;
  const mediumSeverityCount = openDiscrepancies.filter((d) => d.severity === 'MEDIUM').length;
  const lowSeverityCount = openDiscrepancies.filter((d) => d.severity === 'LOW').length;

  return {
    discrepancies: list,
    openDiscrepancies,
    hasDiscrepancies: openDiscrepancies.length > 0,
    highSeverityCount,
    mediumSeverityCount,
    lowSeverityCount,
    loading,
    error,
    retry,
  };
}
