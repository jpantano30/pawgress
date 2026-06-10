import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import BehaviorChart from '../components/shared/BehaviorChart';
import CueTracker from '../components/shared/CueTracker';
import HomeworkTracker from '../components/client/HomeworkTracker';

const COLORS = ['var(--teal)','var(--coral)','#185FA5','#993556','#854F0B','#3B6D11'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

function daysBetween(d1, d2) {
  return Math.ceil((new Date(d2) - new Date(d1)) / (1000*60*60*24));
}

export default function ClientDogView() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  const [dog, setDog] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [reports, setReports] = useState([]);
  const [homeworkLogs, setHomeworkLogs] = useState([]);
  const [cues, setCues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('homework');

  const load = useCallback(async () => {
    try {
      const [dogData, sessionData, reportData, hwData, cueData] = await Promise.all([
        apiFetch(`/api/dogs/${dogId}`),
        apiFetch(`/api/sessions?dog_id=${dogId}`),
        apiFetch(`/api/reports?dog_id=${dogId}`),
        apiFetch(`/api/homework?dog_id=${dogId}`),
        apiFetch(`/api/cues?dog_id=${dogId}`),
      ]);
      setDog(dogData);
      setMetrics(dogData.metrics || []);
      setSessions(sessionData);
      setReports(reportData);
      setHomeworkLogs(hwData);
      setCues(cueData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [dogId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!dog) return <div style={{ padding:32 }}>Dog not found.</div>;

  const publishedSessions = sessions.filter(s => s.is_published);
  const homeworkSessions = publishedSessions.filter(s => s.homework);

  // Find next session date from reports or sessions
  const upcomingReport = reports.find(r => r.next_session && new Date(r.next_session) > new Date());
  const daysUntilNext = upcomingReport ? daysBetween(new Date(), new Date(upcomingReport.next_session)) : null;

  const tabStyle = (t) => ({
    padding:'10px 18px', fontSize:13, cursor:'pointer', border:'none', background:'none',
    borderBottom: activeTab===t ? '2px solid var(--teal)' : '2px solid transparent',
    color: activeTab===t ? 'var(--teal)' : 'var(--gray-text)',
    fontWeight: activeTab===t ? 500 : 400, fontFamily:'var(--font-sans)',
    transition:'color .15s'
  });

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-sans)' }}>
        ← Back
      </button>

      {/* Header card */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:20, marginBottom:16, display:'flex', alignItems:'center', gap:16, boxShadow:'var(--card-shadow)' }}>
        <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--teal-light)', color:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:18, flexShrink:0 }}>
          {initials(dog.name)}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:22, color:'var(--brown)', margin:0 }}>{dog.name}</h1>
          <p style={{ fontSize:13, color:'var(--gray-text)', margin:'3px 0 0' }}>
            {dog.breed && `${dog.breed} · `}{publishedSessions.length} sessions
          </p>
        </div>
        {daysUntilNext !== null && (
          <div style={{ textAlign:'center', background:'var(--teal-light)', borderRadius:'var(--radius-sm)', padding:'10px 16px' }}>
            <div style={{ fontSize:22, fontWeight:600, color:'var(--teal)', fontFamily:'var(--font-serif)' }}>{daysUntilNext}</div>
            <div style={{ fontSize:11, color:'var(--teal-dark)' }}>days to next session</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--gray-border)', marginBottom:20, display:'flex' }}>
        <button style={tabStyle('homework')} onClick={() => setActiveTab('homework')}>
          Practice Log {homeworkSessions.length > 0 && <span style={{ background:'var(--coral)', color:'white', borderRadius:10, padding:'1px 7px', fontSize:10, marginLeft:4 }}>{homeworkSessions.length}</span>}
        </button>
        <button style={tabStyle('progress')} onClick={() => setActiveTab('progress')}>Progress</button>
        <button style={tabStyle('reports')} onClick={() => setActiveTab('reports')}>Session Reports ({reports.length})</button>
        <button style={tabStyle('sessions')} onClick={() => setActiveTab('sessions')}>Notes ({publishedSessions.length})</button>
        <button style={tabStyle('cues')} onClick={() => setActiveTab('cues')}>Cues ({cues.length})</button>
        <button style={tabStyle('intake')} onClick={() => navigate(`/dogs/${dogId}/intake`)}>
          My Intake {!dog.intake_completed_at && <span style={{ background:'var(--coral)', color:'white', borderRadius:10, padding:'1px 6px', fontSize:10, marginLeft:4 }}>!</span>}
        </button>
      </div>

      {activeTab === 'cues' && (
        <CueTracker dog={dog} cues={cues} onCueUpdated={load} apiFetch={apiFetch} readOnly={false} />
      )}

      {activeTab === 'homework' && (
        <HomeworkTracker
          dog={dog}
          sessions={homeworkSessions}
          homeworkLogs={homeworkLogs}
          onLogUpdated={load}
          apiFetch={apiFetch}
        />
      )}

      {activeTab === 'progress' && (
        <div>
          {metrics.length === 0 || publishedSessions.length === 0 ? (
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 8px' }}>Progress charts coming soon</p>
              <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>Charts will appear once your trainer logs sessions with behavior scores.</p>
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
              <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:20, boxShadow:'var(--card-shadow)' }}>
                <BehaviorChart sessions={publishedSessions} metrics={metrics.map((m,i) => ({ ...m, color:COLORS[i%COLORS.length] }))} height={280} />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {reports.length === 0 ? (
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 8px' }}>No reports yet</p>
              <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>Your trainer will share session reports here.</p>
            </div>
          ) : reports.map(r => (
            <div key={r.id} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'18px 20px', boxShadow:'var(--card-shadow)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <h3 style={{ fontFamily:'var(--font-serif)', fontSize:17, color:'var(--brown)', margin:0 }}>{r.title}</h3>
                  <div style={{ fontSize:12, color:'var(--gray-text)', marginTop:3 }}>
                    {new Date(r.report_date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                  </div>
                </div>
              </div>
              {(r.sections||[]).filter(s => s.content?.trim()).map((s, i) => (
                <div key={i} style={{ marginBottom:12 }}>
                  {s.title && <div className="section-label" style={{ marginBottom:4 }}>{s.title}</div>}
                  <p style={{ fontSize:14, color:'var(--brown)', margin:0, lineHeight:1.6 }}>{s.content}</p>
                </div>
              ))}
              {r.overall_notes && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--cream-dark)' }}>
                  <div className="section-label" style={{ marginBottom:4 }}>Overall Notes</div>
                  <p style={{ fontSize:14, color:'var(--brown)', margin:0, lineHeight:1.6 }}>{r.overall_notes}</p>
                </div>
              )}
              {r.homework && (
                <div style={{ marginTop:12, background:'var(--teal-light)', borderRadius:'var(--radius-sm)', padding:'12px 16px' }}>
                  <div className="section-label" style={{ color:'var(--teal-dark)', marginBottom:4 }}>Homework</div>
                  <p style={{ fontSize:14, color:'var(--teal-dark)', margin:0 }}>{r.homework}</p>
                </div>
              )}
              {r.next_session && (
                <div style={{ marginTop:10, fontSize:12, color:'var(--gray-text)' }}>
                  Next session: {new Date(r.next_session).toLocaleDateString('en-US', { month:'long', day:'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {publishedSessions.length === 0 ? (
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>No session notes shared yet.</p>
            </div>
          ) : publishedSessions.map(s => (
            <div key={s.id} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'16px 20px', boxShadow:'var(--card-shadow)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontFamily:'var(--font-serif)', fontSize:14, fontWeight:500, color:'var(--brown)' }}>
                  {new Date(s.session_date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
                </span>
                {s.duration_mins && <span style={{ fontSize:12, color:'var(--gray-text)' }}>{s.duration_mins} min</span>}
              </div>
              {s.summary && <p style={{ fontSize:14, color:'var(--brown)', margin:'0 0 10px', lineHeight:1.6 }}>{s.summary}</p>}
              {s.homework && (
                <div style={{ background:'var(--teal-light)', borderRadius:'var(--radius-sm)', padding:'10px 14px' }}>
                  <div className="section-label" style={{ color:'var(--teal-dark)', marginBottom:3 }}>Homework</div>
                  <p style={{ fontSize:13, color:'var(--teal-dark)', margin:0 }}>{s.homework}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
