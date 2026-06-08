import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import BehaviorChart from '../components/shared/BehaviorChart';

const COLORS = ['#5B4CF5','#1D9E75','#E24B4A','#D85A30','#185FA5','#993556'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

export default function ClientDogView() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  const [dog, setDog] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');
  const [homeworkStatus, setHomeworkStatus] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const [dogData, sessionData] = await Promise.all([
          apiFetch(`/api/dogs/${dogId}`),
          apiFetch(`/api/sessions?dog_id=${dogId}`),
        ]);
        setDog(dogData);
        setMetrics(dogData.metrics || []);
        setSessions(sessionData);
        // Load saved homework completion status from localStorage
        const saved = JSON.parse(localStorage.getItem(`homework_${dogId}`) || '{}');
        setHomeworkStatus(saved);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [dogId]);

  function toggleHomework(sessionId) {
    const updated = { ...homeworkStatus, [sessionId]: !homeworkStatus[sessionId] };
    setHomeworkStatus(updated);
    localStorage.setItem(`homework_${dogId}`, JSON.stringify(updated));
  }

  if (loading) return <div style={{ padding:32, color:'#6b7280' }}>Loading...</div>;
  if (!dog) return <div style={{ padding:32, color:'#dc2626' }}>Dog not found.</div>;

  const publishedSessions = sessions.filter(s => s.is_published);
  const homeworkSessions = publishedSessions.filter(s => s.homework);
  const pendingHomework = homeworkSessions.filter(s => !homeworkStatus[s.id]);
  const latestHomework = pendingHomework[0];

  const tabStyle = (t) => ({
    padding:'10px 16px', fontSize:13, cursor:'pointer', border:'none', background:'none',
    borderBottom: activeTab===t ? '2px solid #5B4CF5' : '2px solid transparent',
    color: activeTab===t ? '#5B4CF5' : '#6b7280',
    fontWeight: activeTab===t ? 500 : 400, fontFamily:'inherit'
  });

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'#6b7280', fontSize:13, cursor:'pointer', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4 }}>← Back</button>

      {/* Header */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20, marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'#ede9fe', color:'#5B4CF5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:17, flexShrink:0 }}>
          {initials(dog.name)}
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0 }}>{dog.name}</h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:'3px 0 0' }}>{dog.breed && `${dog.breed} · `}{publishedSessions.length} sessions logged</p>
        </div>
        {pendingHomework.length > 0 && (
          <div style={{ marginLeft:'auto', background:'#fef9c3', border:'1px solid #fde047', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#854d0e', fontWeight:500 }}>
            📋 {pendingHomework.length} homework pending
          </div>
        )}
      </div>

      {/* Current homework callout */}
      {latestHomework && (
        <div style={{ background:'#ede9fe', border:'1px solid #c4b5fd', borderRadius:10, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:500, color:'#5B4CF5', marginBottom:4 }}>📋 Current homework</div>
            <p style={{ fontSize:14, color:'#3730a3', margin:0 }}>{latestHomework.homework}</p>
            <div style={{ fontSize:11, color:'#7c3aed', marginTop:4 }}>
              Assigned {new Date(latestHomework.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
            </div>
          </div>
          <button onClick={() => toggleHomework(latestHomework.id)} style={{ background:'#5B4CF5', color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, cursor:'pointer', flexShrink:0, fontFamily:'inherit' }}>
            Mark complete ✓
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid #e5e7eb', marginBottom:20, display:'flex' }}>
        <button style={tabStyle('progress')} onClick={() => setActiveTab('progress')}>Progress</button>
        <button style={tabStyle('sessions')} onClick={() => setActiveTab('sessions')}>Session Notes ({publishedSessions.length})</button>
        <button style={tabStyle('homework')} onClick={() => setActiveTab('homework')}>
          Homework {pendingHomework.length > 0 && <span style={{ background:'#5B4CF5', color:'#fff', borderRadius:10, padding:'1px 6px', fontSize:10, marginLeft:4 }}>{pendingHomework.length}</span>}
        </button>
      </div>

      {/* Progress tab */}
      {activeTab === 'progress' && (
        <div>
          {metrics.length === 0 || publishedSessions.length === 0 ? (
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:40, textAlign:'center', color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📈</div>
              <p style={{ fontSize:14, margin:0, color:'#6b7280' }}>Progress charts will appear here once your trainer logs sessions.</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                {metrics.map((m, i) => (
                  <span key={m.id} style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:COLORS[i%COLORS.length]+'18', color:COLORS[i%COLORS.length], fontWeight:500 }}>
                    {m.name}{m.lower_is_better && <span style={{ opacity:.6 }}> ↓ better</span>}
                  </span>
                ))}
              </div>
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20 }}>
                <BehaviorChart sessions={publishedSessions} metrics={metrics.map((m,i) => ({ ...m, color: COLORS[i%COLORS.length] }))} height={280} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {publishedSessions.length === 0 ? (
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:32, textAlign:'center', color:'#9ca3af' }}>
              <p style={{ fontSize:14, margin:0 }}>No session notes shared yet.</p>
            </div>
          ) : publishedSessions.map(s => (
            <div key={s.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:500 }}>
                  {new Date(s.session_date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
                </span>
                {s.duration_mins && <span style={{ fontSize:12, color:'#9ca3af' }}>{s.duration_mins} min</span>}
              </div>
              {s.summary && <p style={{ fontSize:14, color:'#374151', margin:'0 0 10px', lineHeight:1.6 }}>{s.summary}</p>}
              {s.scores && s.scores.length > 0 && (
                <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                  {s.scores.map((sc, i) => {
                    const metric = metrics.find(m => m.id === sc.metric_id);
                    const color = COLORS[metrics.indexOf(metric) % COLORS.length];
                    return metric ? <span key={i} style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background:color+'18', color }}>{metric.name}: {sc.score}</span> : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Homework tab */}
      {activeTab === 'homework' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {homeworkSessions.length === 0 ? (
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:40, textAlign:'center', color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
              <p style={{ fontSize:14, margin:0 }}>No homework assigned yet.</p>
            </div>
          ) : homeworkSessions.map(s => {
            const done = homeworkStatus[s.id];
            return (
              <div key={s.id} style={{ background: done ? '#f0fdf4' : '#fff', border:`1px solid ${done ? '#86efac' : '#e5e7eb'}`, borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:14, opacity: done ? .7 : 1 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>
                    {new Date(s.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </div>
                  <p style={{ fontSize:14, color: done ? '#16a34a' : '#111827', margin:0, textDecoration: done ? 'line-through' : 'none', lineHeight:1.5 }}>{s.homework}</p>
                </div>
                <button onClick={() => toggleHomework(s.id)} style={{
                  padding:'6px 12px', borderRadius:8, border:`1px solid ${done ? '#86efac' : '#e5e7eb'}`,
                  background: done ? '#dcfce7' : '#fff', color: done ? '#16a34a' : '#6b7280',
                  fontSize:12, cursor:'pointer', flexShrink:0, fontFamily:'inherit'
                }}>{done ? '✓ Done' : 'Mark done'}</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
