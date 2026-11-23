import { useState, useEffect, useCallback } from 'react';

export default function useAsync(asyncFunction, immediate = true, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);
      try {
        const response = await asyncFunction(...params);
        const result = response && response.data !== undefined ? response.data : response;
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFunction, ...deps]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  const retry = () => execute();

  return { data, loading, error, execute, retry };
}
