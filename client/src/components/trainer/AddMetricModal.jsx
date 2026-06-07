import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

const PRESETS = [
  { name:'Leash Reactivity', lower_is_better: true, color:'#E24B4A' },
  { name:'LAT Focus', lower_is_better: false, color:'#5B4CF5' },
  { name:'Threshold Distance (ft)', lower_is_better: false, color:'#1D9E75' },
  { name:'Arousal Level', lower_is_better: true, color:'#D85A30' },
  { name:'Recall Reliability', lower_is_better: false, color:'#185FA5' },
  { name:'Focus Duration (sec)', lower_is_better: false, color:'#993556' },
];

export default function AddMetricModal({ dogId, onClose, onSaved }) {
  const { apiFetch } = useApi();
  const [form, setForm] = useState({ name:'', lower_is_better: false, color:'#5B4CF5', scale_min:1, scale_max:10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function applyPreset(p) {
    setForm(f => ({ ...f, name: p.name, lower_is_better: p.lower_is_better, color: p.color }));
  }

  async function handleSave() {
    if (!form.name.trim()) return setError('Metric name is required.');
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify({ dog_id: dogId, ...form }),
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

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:440, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>Add Behavior Metric</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>×</button>
        </div>

        <p style={{ fontSize:13, color:'#6b7280', marginBottom:14 }}>Quick add from common metrics:</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)} style={{
              fontSize:12, padding:'5px 12px', borderRadius:20, cursor:'pointer',
              border: form.name === p.name ? `2px solid ${p.color}` : '1px solid #e5e7eb',
              background: form.name === p.name ? p.color + '18' : '#fff',
              color: form.name === p.name ? p.color : '#374151',
              fontFamily:'inherit'
            }}>{p.name}</button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:5 }}>Metric name *</label>
            <input style={inputStyle} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Leash Reactivity" />
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:5 }}>Scale min</label>
              <input style={inputStyle} type="number" value={form.scale_min}
                onChange={e => setForm(f => ({ ...f, scale_min: parseInt(e.target.value) }))} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:5 }}>Scale max</label>
              <input style={inputStyle} type="number" value={form.scale_max}
                onChange={e => setForm(f => ({ ...f, scale_max: parseInt(e.target.value) }))} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:5 }}>Color</label>
              <input type="color" value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                style={{ width:'100%', height:38, borderRadius:8, border:'1px solid #e5e7eb', cursor:'pointer', padding:2 }} />
            </div>
          </div>

          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#374151' }}>
            <input type="checkbox" checked={form.lower_is_better}
              onChange={e => setForm(f => ({ ...f, lower_is_better: e.target.checked }))} />
            Lower score = better (e.g. reactivity, arousal)
          </label>
        </div>

        {error && (
          <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:14 }}>
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
            {loading ? 'Saving...' : 'Add Metric'}
          </button>
        </div>
      </div>
    </div>
  );
}
