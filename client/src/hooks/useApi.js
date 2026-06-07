import { useAuth } from '@clerk/clerk-react';

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
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  }

  return { apiFetch };
}
