import { useAuth } from '@clerk/clerk-react';
import { useState, useCallback } from 'react';

export function useApi() {
  const { getToken } = useAuth();

  async function apiFetch(path, options = {}) {
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err.error || `Something went wrong (${res.status})`;
      throw new Error(message);
    }
    return res.json();
  }

  return { apiFetch };
}

// Reusable hook for data fetching with loading/error states
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  }, deps);

  return { data, loading, error, reload: load };
}
