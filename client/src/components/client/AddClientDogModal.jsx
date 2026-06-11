import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function AddClientDogModal({ onClose, onSaved }) {
  const { apiFetch } = useApi();
  const [mode, setMode] = useState('choose'); // choose | claim | new
  const [dogCode, setDogCode] = useState('');
  const [form, setForm] = useState({ name:'', breed:'', invite_code:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClaim() {
    if (!dogCode.trim()) return setError('Enter your dog code.');
    setLoading(true); setError(null);
    try {
      const result = await apiFetch('/api/dogs/client-add', {
        method:'POST',
        body: JSON.stringify({ dog_code: dogCode.trim().toUpperCase() }),
      });
      onSaved(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleNew() {
    if (!form.name.trim()) return setError('Dog name is required.');
    setLoading(true); setError(null);
    try {
      const result = await apiFetch('/api/dogs/client-add', {
        method:'POST',
        body: JSON.stringify({ name: form.name, breed: form.breed, invite_code: form.invite_code || undefined }),
      });
      onSaved(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inp = {
    width:'100%', padding:'10px 12px', borderRadius:'var(--radius-sm)',
    border:'1.5px solid var(--gray-border)', fontSize:14, outline:'none',
    fontFamily:'var(--font-sans)', color:'var(--brown)', background:'var(--white)'
  };
  const label = { fontSize:13, fontWeight:500, color:'var(--brown)', display:'block', marginBottom:6 };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:32, width:440, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--brown)', margin:0 }}>Add a Dog</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--gray-text)' }}>×</button>
        </div>

        {mode === 'choose' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <p style={{ fontSize:14, color:'var(--gray-text)', margin:'0 0 8px' }}>
              Does your trainer already have your dog in Pawgress?
            </p>
            <button onClick={() => setMode('claim')} style={{
              padding:'16px', borderRadius:'var(--radius-md)', border:'1.5px solid var(--teal)',
              background:'var(--teal-light)', color:'var(--teal)', fontSize:14, fontWeight:500,
              cursor:'pointer', fontFamily:'var(--font-sans)', textAlign:'left'
            }}>
              <div style={{ fontSize:18, marginBottom:4 }}>🔑</div>
              <div style={{ fontWeight:500 }}>Yes — I have a dog code</div>
              <div style={{ fontSize:12, color:'var(--teal-dark)', marginTop:2 }}>My trainer gave me a code like PAI-X4K</div>
            </button>
            <button onClick={() => setMode('new')} style={{
              padding:'16px', borderRadius:'var(--radius-md)', border:'1.5px solid var(--gray-border)',
              background:'var(--white)', color:'var(--brown)', fontSize:14, fontWeight:500,
              cursor:'pointer', fontFamily:'var(--font-sans)', textAlign:'left'
            }}>
              <div style={{ fontSize:18, marginBottom:4 }}>🐕</div>
              <div style={{ fontWeight:500 }}>No — add a new dog</div>
              <div style={{ fontSize:12, color:'var(--gray-text)', marginTop:2 }}>My trainer doesn't have my dog yet</div>
            </button>
          </div>
        )}

        {mode === 'claim' && (
          <div>
            <button onClick={() => { setMode('choose'); setError(null); }} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4 }}>← Back</button>
            <div style={{ background:'var(--teal-light)', border:'1px solid var(--teal)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:20, fontSize:13, color:'var(--teal-dark)' }}>
              Ask your trainer for your dog's code — they can find it on the dog's profile page.
            </div>
            <label style={label}>Dog code</label>
            <input style={{ ...inp, textAlign:'center', fontSize:22, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:8 }}
              value={dogCode} onChange={e => setDogCode(e.target.value.toUpperCase())}
              placeholder="PAI-X4K" maxLength={7} autoFocus />
            {error && <div style={{ background:'#fef2f2', color:'#b91c1c', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:12 }}>{error}</div>}
            <button onClick={handleClaim} disabled={loading||!dogCode.trim()} style={{ width:'100%', padding:'12px', borderRadius:'var(--radius-sm)', border:'none', background: loading ? '#7ab8a8' : 'var(--teal)', color:'white', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)', marginTop:8 }}>
              {loading ? 'Connecting...' : 'Connect to my dog →'}
            </button>
          </div>
        )}

        {mode === 'new' && (
          <div>
            <button onClick={() => { setMode('choose'); setError(null); }} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4 }}>← Back</button>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={label}>Dog's name *</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Biscuit" autoFocus />
              </div>
              <div>
                <label style={label}>Breed</label>
                <input style={inp} value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="e.g. Golden Retriever" />
              </div>
              <div>
                <label style={label}>Trainer invite code <span style={{ color:'var(--gray-text)', fontWeight:400 }}>(optional)</span></label>
                <input style={{ ...inp, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}
                  value={form.invite_code} onChange={e => setForm(f => ({ ...f, invite_code: e.target.value.toUpperCase() }))}
                  placeholder="ABC-123" maxLength={7} />
                <p style={{ fontSize:11, color:'var(--gray-text)', margin:'5px 0 0' }}>Connects your dog to your trainer's account.</p>
              </div>
            </div>
            {error && <div style={{ background:'#fef2f2', color:'#b91c1c', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, marginTop:12 }}>{error}</div>}
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-border)', background:'var(--white)', fontSize:14, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>Cancel</button>
              <button onClick={handleNew} disabled={loading||!form.name.trim()} style={{ flex:2, padding:'10px', borderRadius:'var(--radius-sm)', border:'none', background: loading ? '#7ab8a8' : 'var(--coral)', color:'white', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
                {loading ? 'Adding...' : 'Add Dog'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
