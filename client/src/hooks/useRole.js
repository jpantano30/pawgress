import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useRole() {
  const { getToken, isLoaded } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
      } else {
        setRole(null); // triggers onboarding
      }
    } catch (err) {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [isLoaded]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  return { role, loading, refetch: fetchRole };
}
