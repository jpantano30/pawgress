import { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

export default function Onboarding({ onComplete }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState('role');
  const [role, setRole] = useState('trainer');
  const [inviteCode, setInviteCode] = useState('');
  const [dogForm, setDogForm] = useState({ name:'', breed:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function apiFetch(path, options = {}) {
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function handleRoleSubmit() {
    setLoading(true); setError(null);
    try {
      await apiFetch('/api/users', {
        method:'POST',
        body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress, full_name: user.fullName || user.firstName || 'User', role }),
      });
      if (role === 'client') setStep('connect');
      else onComplete();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleConnect() {
    if (!inviteCode.trim()) return setError("Enter your trainer's invite code.");
    setLoading(true); setError(null);
    try {
      await apiFetch('/api/users/connect', { method:'POST', body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }) });
      setStep('add-dog');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleAddDog() {
    if (!dogForm.name.trim()) return setError('Dog name is required.');
    setLoading(true); setError(null);
    try {
      await apiFetch('/api/dogs/client-add', { method:'POST', body: JSON.stringify(dogForm) });
      onComplete();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const card = {
    background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'44px 40px',
    width:460, maxWidth:'90vw', border:'1px solid var(--gray-border)',
    boxShadow:'0 2px 12px rgba(61,43,31,0.08)'
  };
  const inp = {
    width:'100%', padding:'11px 14px', borderRadius:'var(--radius-sm)',
    border:'1.5px solid var(--gray-border)', fontSize:15, outline:'none',
    fontFamily:'var(--font-sans)', color:'var(--brown)', background:'var(--white)'
  };
  const btn = {
    width:'100%', padding:'13px', borderRadius:'var(--radius-sm)', border:'none',
    background: loading ? '#b8876f' : 'var(--coral)', color:'white', fontWeight:500,
    fontSize:15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'var(--font-sans)',
    transition:'background .15s'
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)' }}>
      {step === 'role' && (
        <div style={card}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🐾</div>
            <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--teal)', marginBottom:6 }}>Welcome to Pawgress</h1>
            <p style={{ color:'var(--gray-text)', fontSize:14 }}>Are you a trainer or a dog owner?</p>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:28 }}>
            {['trainer','client'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex:1, padding:'18px 12px', borderRadius:'var(--radius-md)', cursor:'pointer',
                border: `2px solid ${role===r ? 'var(--teal)' : 'var(--gray-border)'}`,
                background: role===r ? 'var(--teal-light)' : 'var(--white)',
                color: role===r ? 'var(--teal)' : 'var(--brown-light)',
                fontWeight:500, fontSize:14, fontFamily:'var(--font-sans)',
                transition:'all .15s'
              }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{r === 'trainer' ? '🏋️' : '🐶'}</div>
                {r === 'trainer' ? 'Trainer' : 'Dog Owner'}
              </button>
            ))}
          </div>
          {error && <div style={{ background:'#fef2f2', color:'#b91c1c', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:16 }}>{error}</div>}
          <button onClick={handleRoleSubmit} disabled={loading} style={btn}>{loading ? 'Setting up...' : 'Continue'}</button>
        </div>
      )}

      {step === 'connect' && (
        <div style={card}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔗</div>
            <h1 style={{ fontFamily:'var(--font-serif)', fontSize:24, color:'var(--teal)', marginBottom:8 }}>Connect to your trainer</h1>
            <p style={{ color:'var(--gray-text)', fontSize:14 }}>Ask your trainer for their invite code and enter it below.</p>
          </div>
          <input style={{ ...inp, textAlign:'center', fontSize:24, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:20 }}
            value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
            placeholder="ABC-123" maxLength={7} />
          {error && <div style={{ background:'#fef2f2', color:'#b91c1c', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:16 }}>{error}</div>}
          <button onClick={handleConnect} disabled={loading} style={{ ...btn, marginBottom:10 }}>{loading ? 'Connecting...' : 'Connect to Trainer'}</button>
          <button onClick={() => setStep('add-dog')} style={{ width:'100%', padding:'10px', background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>Skip for now</button>
        </div>
      )}

      {step === 'add-dog' && (
        <div style={card}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🐕</div>
            <h1 style={{ fontFamily:'var(--font-serif)', fontSize:24, color:'var(--teal)', marginBottom:8 }}>Add your dog</h1>
            <p style={{ color:'var(--gray-text)', fontSize:14 }}>You can add more dogs from your dashboard any time.</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
            <input style={inp} placeholder="Dog's name *" value={dogForm.name} onChange={e => setDogForm(f => ({ ...f, name: e.target.value }))} />
            <input style={inp} placeholder="Breed (optional)" value={dogForm.breed} onChange={e => setDogForm(f => ({ ...f, breed: e.target.value }))} />
          </div>
          {error && <div style={{ background:'#fef2f2', color:'#b91c1c', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:16 }}>{error}</div>}
          <button onClick={handleAddDog} disabled={loading} style={{ ...btn, marginBottom:10 }}>{loading ? 'Adding...' : 'Add Dog & Get Started'}</button>
          <button onClick={onComplete} style={{ width:'100%', padding:'10px', background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>Skip — I'll add my dog later</button>
        </div>
      )}
    </div>
  );
}
