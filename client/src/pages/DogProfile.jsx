import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import BehaviorChart from '../components/shared/BehaviorChart';
import LogSessionModal from '../components/trainer/LogSessionModal';
import AddMetricModal from '../components/trainer/AddMetricModal';
import EditDogModal from '../components/trainer/EditDogModal';
import SessionDetail from '../components/trainer/SessionDetail';

const COLORS = ['#5B4CF5','#1D9E75','#E24B4A','#D85A30','#185FA5','#993556','#D97706'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

export default function DogProfile() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();

  const [dog, setDog] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');
  const [showLogSession, setShowLogSession] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showEditDog, setShowEditDog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  async function loadData() {
    try {
      const [dogData, sessionData] = await Promise.all([
        apiFetch(`/api/dogs/${dogId}`),
        apiFetch(`/api/sessions?dog_id=${dogId}`),
      ]);
      setDog(dogData);
      setMetrics(dogData.metrics || []);
      setSessions(sessionData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, [dogId]);

  async function deleteDog() {
    if (!confirm(`Archive ${dog.name}? They'll be hidden from your dashboard.`)) return;
    await apiFetch(`/api/dogs/${dogId}`, { method:'PATCH', body: JSON.stringify({ is_active: false }) });
    navigate('/');
  }

  async function togglePublish(session) {
    await apiFetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: !session.is_published }),
    });
    loadData();
  }

  async function deleteSession(session) {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    await apiFetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
    loadData();
  }

  if (loading) return <div style={{ padding:32, color:'#6b7280' }}>Loading...</div>;
  if (!dog) return <div style={{ padding:32, color:'#dc2626' }}>Dog not found.</div>;

  const tabStyle = (t) => ({
    padding:'10px 16px', fontSize:13, cursor:'pointer', border:'none', background:'none',
    borderBottom: activeTab===t ? '2px solid #5B4CF5' : '2px solid transparent',
    color: activeTab===t ? '#5B4CF5' : '#6b7280',
    fontWeight: activeTab===t ? 500 : 400, fontFamily:'inherit'
  });

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'#6b7280', fontSize:13, cursor:'pointer', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4 }}>
        ← Back to dashboard
      </button>

      {/* Dog header */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20, marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'#ede9fe', color:'#5B4CF5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:18, flexShrink:0 }}>
          {initials(dog.name)}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0 }}>{dog.name}</h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:'3px 0 0' }}>
            {dog.owner_name}{dog.breed ? ` · ${dog.breed}` : ''} · {sessions.length} sessions
          </p>
          {dog.notes && <p style={{ fontSize:13, color:'#9ca3af', margin:'4px 0 0' }}>{dog.notes}</p>}
        </div>
        <div style={{ display:'flex', gap:8' }}>
          <button onClick={() => setShowEditDog(true)} style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:8, padding:'7px 14px', fontSize:13, cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>Edit</button>
          <button onClick={() => setShowLogSession(true)} style={{ background:'#5B4CF5', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontSize:14, fontWeight:500, cursor:'pointer' }}>+ Log Session</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid #e5e7eb', marginBottom:20, display:'flex' }}>
        <button style={tabStyle('progress')} onClick={() => setActiveTab('progress')}>Progress Charts</button>
        <button style={tabStyle('sessions')} onClick={() => setActiveTab('sessions')}>Sessions ({sessions.length})</button>
        <button style={tabStyle('homework')} onClick={() => setActiveTab('homework')}>Homework</button>
      </div>

      {/* Progress tab */}
      {activeTab === 'progress' && (
        <div>
          {metrics.length === 0 ? (
            <div style={{ border:'2px dashed #e5e7eb', borderRadius:12, padding:40, textAlign:'center', color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📊</div>
              <p style={{ fontSize:15, fontWeight:500, color:'#6b7280', margin:'0 0 6px' }}>No behavior metrics yet</p>
              <p style={{ fontSize:13, margin:'0 0 20px' }}>Add metrics like "Leash Reactivity" or "LAT Focus" to start tracking progress</p>
              <button onClick={() => setShowAddMetric(true)} style={{ background:'#5B4CF5', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontSize:14, fontWeight:500, cursor:'pointer' }}>+ Add First Metric</button>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {metrics.map((m, i) => (
                    <span key={m.id} style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:COLORS[i%COLORS.length]+'18', color:COLORS[i%COLORS.length], fontWeight:500 }}>
                      {m.name}{m.lower_is_better && <span style={{ opacity:.6 }}> ↓</span>}
                    </span>
                  ))}
                </div>
                <button onClick={() => setShowAddMetric(true)} style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 14px', fontSize:13, cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>+ Add Metric</button>
              </div>
              {sessions.length === 0 ? (
                <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:32, textAlign:'center', color:'#9ca3af' }}>
                  <p style={{ fontSize:14, margin:0 }}>No sessions yet. Click <strong>+ Log Session</strong> to add your first one.</p>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20 }}>
                  <BehaviorChart sessions={sessions} metrics={metrics.map((m,i) => ({ ...m, color: COLORS[i%COLORS.length] }))} height={300} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {sessions.length === 0 ? (
            <div style={{ border:'2px dashed #e5e7eb', borderRadius:12, padding:40, textAlign:'center', color:'#9ca3af' }}>
              <p style={{ fontSize:14, margin:0 }}>No sessions yet.</p>
            </div>
          ) : sessions.map(s => (
            <div key={s.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'14px 18px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ minWidth:72 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>
                    {new Date(s.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                  </div>
                  {s.duration_mins && <div style={{ fontSize:11, color:'#9ca3af' }}>{s.duration_mins} min</div>}
                </div>
                <div style={{ flex:1 }}>
                  {s.summary && <p style={{ fontSize:13, color:'#374151', margin:'0 0 4px' }}>{s.summary}</p>}
                  {s.homework && <p style={{ fontSize:12, color:'#6b7280', margin:0 }}><strong>Homework:</strong> {s.homework}</p>}
                  {s.scores && s.scores.length > 0 && (
                    <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                      {s.scores.map((sc, i) => {
                        const metric = metrics.find(m => m.id === sc.metric_id);
                        const color = COLORS[metrics.indexOf(metric) % COLORS.length];
                        return metric ? <span key={i} style={{ fontSize:11, padding:'2px 8px', borderRadius:12, background:color+'18', color }}>{metric.name}: {sc.score}</span> : null;
                      })}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:6', alignItems:'center', flexShrink:0 }}>
                  <button onClick={() => togglePublish(s)} style={{
                    fontSize:11, padding:'3px 10px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit',
                    background: s.is_published ? '#dcfce7' : '#fef9c3',
                    color: s.is_published ? '#166534' : '#854d0e'
                  }}>{s.is_published ? '✓ Published' : '○ Draft'}</button>
                  <button onClick={() => setSelectedSession(s)} style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:8, padding:'3px 10px', fontSize:12, cursor:'pointer', color:'#6b7280', fontFamily:'inherit' }}>Edit</button>
                  <button onClick={() => deleteSession(s)} style={{ background:'none', border:'none', padding:'3px 6px', fontSize:14, cursor:'pointer', color:'#dc2626' }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Homework tab */}
      {activeTab === 'homework' && (
        <div>
          <div style={{ marginBottom:16, padding:'14px 18px', background:'#ede9fe', borderRadius:10, border:'1px solid #c4b5fd' }}>
            <div style={{ fontSize:12, fontWeight:500, color:'#5B4CF5', marginBottom:4 }}>How homework tracking works</div>
            <p style={{ fontSize:13, color:'#4c1d95', margin:0 }}>Homework is assigned when you log a session. Clients see their current homework on their portal. Mark it complete here once you've confirmed it at the next session.</p>
          </div>
          {sessions.filter(s => s.homework).length === 0 ? (
            <div style={{ border:'2px dashed #e5e7eb', borderRadius:12, padding:40, textAlign:'center', color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
              <p style={{ fontSize:14, margin:0 }}>No homework assigned yet. Add homework when logging a session.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {sessions.filter(s => s.homework).map(s => (
                <div key={s.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:'#9ca3af', marginBottom:4 }}>
                      Assigned {new Date(s.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                      {s.is_published ? '' : ' · (draft — not visible to client)'}
                    </div>
                    <p style={{ fontSize:14, color:'#111827', margin:0, lineHeight:1.5 }}>{s.homework}</p>
                  </div>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background: s.is_published ? '#dcfce7' : '#fef9c3', color: s.is_published ? '#166534' : '#854d0e', flexShrink:0 }}>
                    {s.is_published ? 'Visible to client' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showLogSession && <LogSessionModal dog={dog} metrics={metrics} onClose={() => setShowLogSession(false)} onSaved={() => { setShowLogSession(false); loadData(); }} />}
      {showAddMetric && <AddMetricModal dogId={dogId} onClose={() => setShowAddMetric(false)} onSaved={() => { setShowAddMetric(false); loadData(); }} />}
      {showEditDog && <EditDogModal dog={dog} onClose={() => setShowEditDog(false)} onSaved={() => { setShowEditDog(false); loadData(); }} onDelete={deleteDog} />}
      {selectedSession && <SessionDetail session={selectedSession} metrics={metrics} onClose={() => setSelectedSession(null)} onSaved={() => { setSelectedSession(null); loadData(); }} />}
    </div>
  );
}
