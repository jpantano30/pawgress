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
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [dogId]);

  if (loading) return <div style={{ padding:32, color:'#6b7280' }}>Loading...</div>;
  if (!dog) return <div style={{ padding:32, color:'#dc2626' }}>Dog not found.</div>;

  const tabStyle = (t) => ({
    padding:'10px 16px', fontSize:13, cursor:'pointer', border:'none', background:'none',
    borderBottom: activeTab===t ? '2px solid #5B4CF5' : '2px solid transparent',
    color: activeTab===t ? '#5B4CF5' : '#6b7280',
    fontWeight: activeTab===t ? 500 : 400, fontFamily:'inherit'
  });

  const publishedSessions = sessions.filter(s => s.is_published);
  const latestHomework = publishedSessions.find(s => s.homework)?.homework;

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <button onClick={() => navigate('/')} style={{
        background:'none', border:'none', color:'#6b7280', fontSize:13,
        cursor:'pointer', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4
      }}>← Back</button>

      {/* Header */}
      <div style={{
        background:'#fff', border:'1px solid #e5e7eb', borderRadius:12,
        padding:20, marginBottom:16, display:'flex', alignItems:'center', gap:16
      }}>
        <div style={{
          width:52, height:52, borderRadius:'50%', background:'#ede9fe',
          color:'#5B4CF5', display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:600, fontSize:17, flexShrink:0
        }}>
          {dog.photo_url
            ? <img src={dog.photo_url} alt={dog.name} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover' }}/>
            : initials(dog.name)
          }
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, margin:0, color:'#111827' }}>{dog.name}</h1>
          <p style={{ fontSize:13, color:'#6b7280', margin:'3px 0 0' }}>
            {dog.breed && `${dog.breed} · `}{publishedSessions.length} sessions
          </p>
        </div>
      </div>

      {/* Homework callout */}
      {latestHomework && (
        <div style={{
          background:'#ede9fe', border:'1px solid #c4b5fd', borderRadius:10,
          padding:'14px 18px', marginBottom:16
        }}>
          <div style={{ fontSize:12, fontWeight:500, color:'#5B4CF5', marginBottom:4 }}>📋 Current homework</div>
          <p style={{ fontSize:14, color:'#3730a3', margin:0 }}>{latestHomework}</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid #e5e7eb', marginBottom:20, display:'flex' }}>
        <button style={tabStyle('progress')} onClick={() => setActiveTab('progress')}>Progress</button>
        <button style={tabStyle('sessions')} onClick={() => setActiveTab('sessions')}>
          Session Notes ({publishedSessions.length})
        </button>
      </div>

      {/* Progress tab */}
      {activeTab === 'progress' && (
        <div>
          {metrics.length === 0 || publishedSessions.length === 0 ? (
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:40, textAlign:'center', color:'#9ca3af' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📈</div>
              <p style={{ fontSize:14, margin:0, color:'#6b7280' }}>
                Progress charts will appear here once your trainer logs sessions.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                {metrics.map((m, i) => (
                  <span key={m.id} style={{
                    fontSize:12, padding:'4px 10px', borderRadius:20,
                    background: COLORS[i % COLORS.length] + '18',
                    color: COLORS[i % COLORS.length], fontWeight:500
                  }}>{m.name}{m.lower_is_better && <span style={{ opacity:.6 }}> ↓ better</span>}</span>
                ))}
              </div>
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20 }}>
                <BehaviorChart
                  sessions={publishedSessions}
                  metrics={metrics.map((m,i) => ({ ...m, color: COLORS[i % COLORS.length] }))}
                  height={280}
                />
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
            <div key={s.id} style={{
              background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'16px 20px'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:500, color:'#111827' }}>
                  {new Date(s.session_date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
                </span>
                {s.duration_mins && <span style={{ fontSize:12, color:'#9ca3af' }}>{s.duration_mins} min</span>}
              </div>
              {s.summary && <p style={{ fontSize:14, color:'#374151', margin:'0 0 10px', lineHeight:1.6 }}>{s.summary}</p>}
              {s.homework && (
                <div style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px', marginTop:8 }}>
                  <div style={{ fontSize:11, fontWeight:500, color:'#6b7280', marginBottom:4 }}>HOMEWORK</div>
                  <p style={{ fontSize:13, color:'#374151', margin:0 }}>{s.homework}</p>
                </div>
              )}
              {s.scores && s.scores.length > 0 && (
                <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                  {s.scores.map((sc, i) => {
                    const metric = metrics.find(m => m.id === sc.metric_id);
                    const color = COLORS[metrics.indexOf(metric) % COLORS.length];
                    return metric ? (
                      <span key={i} style={{
                        fontSize:11, padding:'3px 10px', borderRadius:12,
                        background: color + '18', color
                      }}>{metric.name}: {sc.score}</span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
