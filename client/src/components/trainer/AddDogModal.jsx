import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function AddDogModal({ onClose, onSaved }) {
  const { apiFetch } = useApi();
  const [form, setForm] = useState({ name:'', breed:'', owner_name:'', owner_email:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function handleSave() {
    if (!form.name.trim()) return setError('Dog name is required.');
    if (!form.owner_email.trim()) return setError('Owner email is required.');
    if (!form.owner_name.trim()) return setError('Owner name is required.');
    setLoading(true);
    setError(null);
    try {
      const owner = await apiFetch('/api/users/find-or-invite', {
        method: 'POST',
        body: JSON.stringify({ email: form.owner_email, full_name: form.owner_name }),
      });
      await apiFetch('/api/dogs', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name, breed: form.breed,
          owner_id: owner.id, notes: form.notes,
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width:'100%', padding:'9px 12px', borderRadius:8,
    border:'1px solid #e5e7eb', fontSize:14, outline:'none',
    fontFamily:'inherit', background:'#fff', color:'#111827'
  };
  const labelStyle = { fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:5 };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:440, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>Add a Dog</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>×</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={labelStyle}>Dog's name *</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Tallulah" />
          </div>
          <div>
            <label style={labelStyle}>Breed</label>
            <input style={inputStyle} value={form.breed} onChange={e => set('breed', e.target.value)} placeholder="e.g. Border Collie mix" />
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Owner's name *</label>
              <input style={inputStyle} value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="e.g. Jo Shmo" />
            </div>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Owner's email *</label>
              <input style={inputStyle} type="email" value={form.owner_email} onChange={e => set('owner_email', e.target.value)} placeholder="owner@email.com" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize:'vertical', minHeight:80 }}
              value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Behavioral background, goals, anything relevant..." />
          </div>
        </div>

        {error && (
          <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:16 }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          <button onClick={onClose} style={{
            flex:1, padding:'10px', borderRadius:8, border:'1px solid #e5e7eb',
            background:'#fff', fontSize:14, cursor:'pointer', color:'#374151', fontFamily:'inherit'
          }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{
            flex:2, padding:'10px', borderRadius:8, border:'none',
            background: loading ? '#a5b4fc' : '#5B4CF5',
            color:'#fff', fontSize:14, fontWeight:500,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit'
          }}>
            {loading ? 'Saving...' : 'Add Dog'}
          </button>
        </div>
      </div>
    </div>
  );
}
