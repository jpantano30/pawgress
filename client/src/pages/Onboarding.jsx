import { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

export default function Onboarding({ onComplete }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [role, setRole] = useState('trainer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress.emailAddress,
          full_name: user.fullName || user.firstName || 'User',
          role,
        }),
      });

      if (res.ok) {
        onComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Try again.');
      }
    } catch (err) {
      setError('Could not connect to server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px', width: 400, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Welcome to Pawgress</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>Are you a trainer or a dog owner?</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {['trainer', 'client'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '14px', borderRadius: 10,
              border: `2px solid ${role === r ? '#5B4CF5' : '#e5e7eb'}`,
              background: role === r ? '#f0effe' : '#fff',
              color: role === r ? '#5B4CF5' : '#374151',
              fontWeight: 500, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize'
            }}>
              {r === 'trainer' ? '🏋️ Trainer' : '🐶 Dog Owner'}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
            {error}
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: loading ? '#a5b4fc' : '#5B4CF5',
          color: '#fff', fontWeight: 500, fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}>
          {loading ? 'Setting up...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
