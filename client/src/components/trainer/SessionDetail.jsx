import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function SessionDetail({ session, metrics, onClose, onSaved }) {
  const { apiFetch } = useApi();
  const [form, setForm] = useState({
    session_date: session.session_date?.split('T')[0] || session.session_date,
    duration_mins: session.duration_mins || '',
    location: session.location || '',
    overall_rating: session.overall_rating || 4,
    summary: session.summary || '',
    homework: session.homework || '',
    is_published: session.is_published,
  });
  const [scores, setScores] = useState(
    metrics.reduce((acc, m) => {
      const existing = session.scores?.find(s => s.metric_id === m.id);
      return { ...acc, [m.id]: existing ? existing.score : '' };
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    setLoading(true); setError(null);
    try {
      const scorePayload = Object.entries(scores)
        .filter(([, v]) => v !== '')
        .map(([metric_id, score]) => ({ metric_id, score: parseFloat(score) }));
      await apiFetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...form, duration_mins: form.duration_mins ? parseInt(form.duration_mins) : null, scores: scorePayload }),
      });
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputStyle = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'inherit', color:'#111827' };
  const labelStyle = { fontSize:13, fontWeight:500, display:'block', marginBottom:5 };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, overflowY:'auto', padding:'20px 0' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:500, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>Edit Session</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#6b7280' }}>×</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Date</label>
              <input style={inputStyle} type="date" value={form.session_date} onChange={e => setField('session_date', e.target.value)} />
            </div>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Duration (min)</label>
              <input style={inputStyle} type="number" value={form.duration_mins} onChange={e => setField('duration_mins', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={form.location} onChange={e => setField('location', e.target.value)} />
          </div>
          {metrics.length > 0 && (
            <div>
              <label style={labelStyle}>Behavior Scores</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {metrics.map(m => (
                  <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:12, minWidth:160, color:'#374151', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:m.color, display:'inline-block' }}/>
                      {m.name}
                    </span>
                    <input type="number" min={m.scale_min} max={m.scale_max} step="0.5"
                      value={scores[m.id]} onChange={e => setScores(s => ({ ...s, [m.id]: e.target.value }))}
                      placeholder={`${m.scale_min}–${m.scale_max}`} style={{ ...inputStyle, width:80 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label style={labelStyle}>Session summary</label>
            <textarea style={{ ...inputStyle, resize:'vertical', minHeight:80 }} value={form.summary} onChange={e => setField('summary', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Homework</label>
            <textarea style={{ ...inputStyle, resize:'vertical', minHeight:60 }} value={form.homework} onChange={e => setField('homework', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Rating</label>
            <div style={{ display:'flex', gap:6 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setField('overall_rating', n)} style={{ width:36, height:36, borderRadius:8, border:'1px solid #e5e7eb', background: form.overall_rating >= n ? '#fef9c3' : '#fff', fontSize:18, cursor:'pointer' }}>★</button>
              ))}
            </div>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => setField('is_published', e.target.checked)} />
            Published (visible to client)
          </label>
        </div>
        {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginTop:14 }}>{error}</div>}
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:14, cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:'10px', borderRadius:8, border:'none', background: loading ? '#a5b4fc' : '#5B4CF5', color:'#fff', fontSize:14, fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
