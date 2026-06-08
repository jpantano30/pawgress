import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function EditDogModal({ dog, onClose, onSaved, onDelete }) {
  const { apiFetch } = useApi();
  const [form, setForm] = useState({ name: dog.name, breed: dog.breed || '', notes: dog.notes || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); }

  async function handleSave() {
    if (!form.name.trim()) return setError('Name is required.');
    setLoading(true); setError(null);
    try {
      await apiFetch(`/api/dogs/${dog.id}`, { method:'PATCH', body: JSON.stringify(form) });
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputStyle = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'inherit', color:'#111827' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:440, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>Edit Dog</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>×</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:5 }}>Name *</label>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:5 }}>Breed</label>
            <input style={inputStyle} value={form.breed} onChange={e => set('breed', e.target.value)} placeholder="e.g. Border Collie mix" />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:5 }}>Notes</label>
            <textarea style={{ ...inputStyle, resize:'vertical', minHeight:80 }} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:14 }}>{error}</div>}
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          <button onClick={onDelete} style={{ padding:'10px 14px', borderRadius:8, border:'1px solid #fca5a5', background:'#fff', fontSize:13, cursor:'pointer', color:'#dc2626', fontFamily:'inherit' }}>Archive Dog</button>
          <div style={{ flex:1 }} />
          <button onClick={onClose} style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:14, cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ padding:'10px 20px', borderRadius:8, border:'none', background: loading ? '#a5b4fc' : '#5B4CF5', color:'#fff', fontSize:14, fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
