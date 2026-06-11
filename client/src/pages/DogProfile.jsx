import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import BehaviorChart from '../components/shared/BehaviorChart';
import LogSessionModal from '../components/trainer/LogSessionModal';
import AddMetricModal from '../components/trainer/AddMetricModal';
import EditDogModal from '../components/trainer/EditDogModal';
import SessionDetail from '../components/trainer/SessionDetail';
import CueTracker from '../components/shared/CueTracker';

const COLORS = ['var(--teal)','var(--coral)','#185FA5','#993556','#854F0B','#3B6D11'];

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
  const [reports, setReports] = useState([]);
  const [cues, setCues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');
  const [showLogSession, setShowLogSession] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showEditDog, setShowEditDog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  async function loadData() {
    try {
      const [dogData, sessionData, reportData, cueData] = await Promise.all([
        apiFetch(`/api/dogs/${dogId}`),
        apiFetch(`/api/sessions?dog_id=${dogId}`),
        apiFetch(`/api/reports?dog_id=${dogId}`),
        apiFetch(`/api/cues?dog_id=${dogId}`),
      ]);
      setDog(dogData);
      setMetrics(dogData.metrics || []);
      setSessions(sessionData);
      setReports(reportData);
      setCues(cueData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, [dogId]);

  async function deleteDog() {
    if (!confirm(`Archive ${dog.name}?`)) return;
    await apiFetch(`/api/dogs/${dogId}`, { method:'PATCH', body: JSON.stringify({ is_active: false }) });
    navigate('/');
  }

  async function togglePublish(session) {
    await apiFetch(`/api/sessions/${session.id}`, { method:'PATCH', body: JSON.stringify({ is_published: !session.is_published }) });
    loadData();
  }

  async function deleteSession(session) {
    if (!confirm('Delete this session?')) return;
    await apiFetch(`/api/sessions/${session.id}`, { method:'DELETE' });
    loadData();
  }

  async function deleteReport(report) {
    if (!confirm('Delete this report?')) return;
    await apiFetch(`/api/reports/${report.id}`, { method:'DELETE' });
    loadData();
  }

  async function togglePublishReport(report) {
    await apiFetch(`/api/reports/${report.id}`, { method:'PATCH', body: JSON.stringify({ status: report.status === 'published' ? 'draft' : 'published' }) });
    loadData();
  }

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!dog) return <div style={{ padding:32 }}>Dog not found.</div>;

  const tabStyle = (t) => ({
    padding:'10px 16px', fontSize:13, cursor:'pointer', border:'none', background:'none',
    borderBottom: activeTab===t ? '2px solid var(--teal)' : '2px solid transparent',
    color: activeTab===t ? 'var(--teal)' : 'var(--gray-text)',
    fontWeight: activeTab===t ? 500 : 400, fontFamily:'var(--font-sans)', transition:'color .15s'
  });

  const drafts = reports.filter(r => r.status === 'draft');

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', padding:'0 0 16px', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-sans)' }}>
        ← Back to dashboard
      </button>

      {/* Dog header */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:20, marginBottom:20, display:'flex', alignItems:'center', gap:16, boxShadow:'var(--card-shadow)' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--teal-light)', color:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:18, flexShrink:0 }}>
          {initials(dog.name)}
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:22, color:'var(--brown)', margin:0 }}>{dog.name}</h1>
          <p style={{ fontSize:13, color:'var(--gray-text)', margin:'3px 0 0' }}>
            {dog.owner_name}{dog.breed ? ` · ${dog.breed}` : ''} · {sessions.length} sessions
          </p>
          {dog.dog_code && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:6, background:'var(--cream)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'4px 12px' }}>
              <span style={{ fontSize:11, color:'var(--gray-text)' }}>Dog code:</span>
              <span style={{ fontWeight:600, fontSize:14, color:'var(--teal)', letterSpacing:'0.1em' }}>{dog.dog_code}</span>
              <button onClick={() => { navigator.clipboard.writeText(dog.dog_code); }} style={{ background:'none', border:'none', fontSize:11, color:'var(--coral)', cursor:'pointer', fontFamily:'var(--font-sans)', padding:0 }}>Copy</button>
            </div>
          )}
          {dog.notes && <p style={{ fontSize:13, color:'var(--gray-text)', margin:'4px 0 0', fontStyle:'italic' }}>{dog.notes}</p>}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setShowEditDog(true)} style={{ background:'var(--white)', border:'1.5px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'7px 14px', fontSize:13, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>Edit</button>
          <button onClick={() => navigate(`/dogs/${dogId}/reports/new`)} style={{ background:'var(--teal)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 16px', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            + Day Report
          </button>
          <button onClick={() => setShowLogSession(true)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'9px 18px', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            + Log Session
          </button>
        </div>
      </div>

      {drafts.length > 0 && (
        <div style={{ background:'var(--coral-light)', border:'1px solid var(--coral)', borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'var(--coral-dark)' }}>📝 {drafts.length} draft report{drafts.length>1?'s':''} not yet sent to client</span>
          <button onClick={() => setActiveTab('reports')} style={{ background:'none', border:'none', color:'var(--coral)', fontSize:13, cursor:'pointer', fontWeight:500, fontFamily:'var(--font-sans)' }}>View →</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--gray-border)', marginBottom:20, display:'flex' }}>
        <button style={tabStyle('progress')} onClick={() => setActiveTab('progress')}>Progress Charts</button>
        <button style={tabStyle('sessions')} onClick={() => setActiveTab('sessions')}>Sessions ({sessions.length})</button>
        <button style={tabStyle('reports')} onClick={() => setActiveTab('reports')}>
          Reports ({reports.length}){drafts.length>0 && <span style={{ background:'var(--coral)', color:'white', borderRadius:10, padding:'1px 6px', fontSize:10, marginLeft:4 }}>{drafts.length}</span>}
        </button>
        <button style={tabStyle('cues')} onClick={() => setActiveTab('cues')}>Cues ({cues.length})</button>
        <button style={tabStyle('homework')} onClick={() => setActiveTab('homework')}>Homework</button>
        <button style={tabStyle('intake')} onClick={() => navigate(`/dogs/${dogId}/intake`)}>
          Intake {!dog.intake_completed_at && <span style={{ background:'var(--coral)', color:'white', borderRadius:10, padding:'1px 6px', fontSize:10, marginLeft:4 }}>!</span>}
        </button>
      </div>

      {/* Progress tab */}
      {activeTab === 'progress' && (
        <div>
          {metrics.length === 0 ? (
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📊</div>
              <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 6px' }}>No behavior metrics yet</p>
              <p style={{ fontSize:13, color:'var(--gray-text)', margin:'0 0 20px' }}>Add metrics like "Leash Reactivity" or "LAT Focus" to start tracking progress</p>
              <button onClick={() => setShowAddMetric(true)} style={{ background:'var(--teal)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'9px 20px', fontSize:14, cursor:'pointer', fontFamily:'var(--font-sans)' }}>+ Add First Metric</button>
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
                <button onClick={() => setShowAddMetric(true)} style={{ background:'var(--white)', border:'1.5px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'6px 14px', fontSize:13, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>+ Metric</button>
              </div>
              {sessions.length === 0 ? (
                <div style={{ border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:32, textAlign:'center', background:'var(--white)' }}>
                  <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>Log a session to start seeing progress charts.</p>
                </div>
              ) : (
                <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:20, boxShadow:'var(--card-shadow)' }}>
                  <BehaviorChart sessions={sessions} metrics={metrics.map((m,i) => ({ ...m, color:COLORS[i%COLORS.length] }))} height={300} />
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
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>No sessions yet.</p>
            </div>
          ) : sessions.map(s => (
            <div key={s.id} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'14px 18px', boxShadow:'var(--card-shadow)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ minWidth:72 }}>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:14, color:'var(--brown)', fontWeight:500 }}>
                    {new Date(s.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                  </div>
                  {s.duration_mins && <div style={{ fontSize:11, color:'var(--gray-text)' }}>{s.duration_mins} min</div>}
                </div>
                <div style={{ flex:1 }}>
                  {s.summary && <p style={{ fontSize:13, color:'var(--brown)', margin:'0 0 4px', lineHeight:1.5 }}>{s.summary}</p>}
                  {s.homework && <p style={{ fontSize:12, color:'var(--gray-text)', margin:0 }}><strong>Homework:</strong> {s.homework}</p>}
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                  <button onClick={() => togglePublish(s)} style={{ fontSize:11, padding:'3px 10px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'var(--font-sans)', background: s.is_published ? '#E8F4F0' : '#FAEEDA', color: s.is_published ? 'var(--teal-dark)' : '#854F0B' }}>
                    {s.is_published ? '✓ Published' : '○ Draft'}
                  </button>
                  <button onClick={() => setSelectedSession(s)} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'3px 10px', fontSize:12, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>Edit</button>
                  <button onClick={() => deleteSession(s)} style={{ background:'none', border:'none', padding:'3px 6px', fontSize:16, cursor:'pointer', color:'var(--gray-text)' }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports tab */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
            <button onClick={() => navigate(`/dogs/${dogId}/reports/new`)} style={{ background:'var(--teal)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 18px', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
              + New Day Report
            </button>
          </div>
          {reports.length === 0 ? (
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📄</div>
              <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 6px' }}>No reports yet</p>
              <p style={{ fontSize:13, color:'var(--gray-text)', margin:'0 0 20px' }}>Create a day training report that autosaves as you go, then publish when ready.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {reports.map(r => (
                <div key={r.id} style={{ background:'var(--white)', border:`1px solid ${r.status==='draft' ? 'var(--coral)' : 'var(--gray-border)'}`, borderRadius:'var(--radius-md)', padding:'14px 18px', boxShadow:'var(--card-shadow)', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:15, color:'var(--brown)', fontWeight:500 }}>{r.title}</div>
                    <div style={{ fontSize:12, color:'var(--gray-text)', marginTop:2 }}>
                      {new Date(r.report_date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      {r.status === 'draft' && <span style={{ marginLeft:8, color:'var(--coral)', fontWeight:500 }}>· Draft</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => navigate(`/dogs/${dogId}/reports/${r.id}`)} style={{ background:'var(--white)', border:'1.5px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'6px 14px', fontSize:12, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>
                      {r.status === 'draft' ? 'Continue editing' : 'View / Edit'}
                    </button>
                    <button onClick={() => togglePublishReport(r)} style={{ background: r.status==='draft' ? 'var(--teal)' : 'var(--white)', color: r.status==='draft' ? 'white' : 'var(--gray-text)', border:`1px solid ${r.status==='draft' ? 'var(--teal)' : 'var(--gray-border)'}`, borderRadius:'var(--radius-sm)', padding:'6px 14px', fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
                      {r.status === 'draft' ? 'Publish' : 'Unpublish'}
                    </button>
                    <button onClick={() => deleteReport(r)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'var(--gray-text)', padding:'0 4px' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Homework tab */}
      {activeTab === 'homework' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {sessions.filter(s => s.homework).length === 0 ? (
            <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
              <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>Assign homework when logging a session.</p>
            </div>
          ) : sessions.filter(s => s.homework).map(s => (
            <div key={s.id} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'14px 18px', boxShadow:'var(--card-shadow)', display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:'var(--gray-text)', marginBottom:4 }}>
                  Assigned {new Date(s.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                  {!s.is_published && <span style={{ color:'var(--coral)', marginLeft:6 }}>· draft</span>}
                </div>
                <p style={{ fontSize:14, color:'var(--brown)', margin:0, lineHeight:1.5 }}>{s.homework}</p>
              </div>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background: s.is_published ? '#E8F4F0' : '#FAEEDA', color: s.is_published ? 'var(--teal-dark)' : '#854F0B', flexShrink:0 }}>
                {s.is_published ? 'Visible to client' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cues' && (
        <CueTracker dog={dog} cues={cues} onCueUpdated={loadData} apiFetch={apiFetch} readOnly={false} />
      )}

      {showLogSession && <LogSessionModal dog={dog} metrics={metrics} onClose={() => setShowLogSession(false)} onSaved={() => { setShowLogSession(false); loadData(); }} />}
      {showAddMetric && <AddMetricModal dogId={dogId} onClose={() => setShowAddMetric(false)} onSaved={() => { setShowAddMetric(false); loadData(); }} />}
      {showEditDog && <EditDogModal dog={dog} onClose={() => setShowEditDog(false)} onSaved={() => { setShowEditDog(false); loadData(); }} onDelete={deleteDog} />}
      {selectedSession && <SessionDetail session={selectedSession} metrics={metrics} onClose={() => setSelectedSession(null)} onSaved={() => { setSelectedSession(null); loadData(); }} />}
    </div>
  );
}
