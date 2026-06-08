import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function AddClientDogModal({ onClose, onSaved }) {
  const { apiFetch } = useApi();
  const [form, setForm] = useState({ name:'', breed:'', invite_code:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    if (!form.name.trim()) return setError('Dog name is required.');
    setLoading(true); setError(null);
    try {
      await apiFetch('/api/dogs/client-add', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, breed: form.breed, invite_code: form.invite_code.trim().toUpperCase() || undefined }),
      });
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputStyle = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'inherit', color:'#111827' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:420, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>Add a Dog</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>×</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:5 }}>Dog's name *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Biscuit" />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:5 }}>Breed</label>
            <input style={inputStyle} value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="e.g. Golden Retriever" />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:5 }}>Trainer invite code <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span></label>
            <input style={{ ...inputStyle, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}
              value={form.invite_code}
              onChange={e => setForm(f => ({ ...f, invite_code: e.target.value.toUpperCase() }))}
              placeholder="ABC-123"
              maxLength={7}
            />
            <p style={{ fontSize:11, color:'#9ca3af', margin:'5px 0 0' }}>Ask your trainer for their code to link your dog to their account.</p>
          </div>
        </div>
        {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:14 }}>{error}</div>}
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:14, cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:'10px', borderRadius:8, border:'none', background: loading ? '#a5b4fc' : '#5B4CF5', color:'#fff', fontSize:14, fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
            {loading ? 'Adding...' : 'Add Dog'}
          </button>
        </div>
      </div>
    </div>
  );
}
