import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../hooks/useApi';
import AddDogModal from '../components/trainer/AddDogModal';
import WelcomeModal from '../components/shared/WelcomeModal';

const COLORS = ['var(--teal)','var(--coral)','#185FA5','#993556','#854F0B','#3B6D11'];
const COLOR_BG = ['var(--teal-light)','var(--coral-light)','#E6F1FB','#FBEAF0','#FAEEDA','#EAF3DE'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

export default function TrainerDashboard() {
  const { apiFetch } = useApi();
  const { user } = useUser();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [stats, setStats] = useState({ sessions_this_month:0, avg_rating:null, drafts:0 });
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDog, setShowAddDog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadData() {
    try {
      const [dogsData, statsData, meData] = await Promise.all([
        apiFetch('/api/dogs'),
        apiFetch('/api/sessions/stats'),
        apiFetch('/api/users/me'),
      ]);
      setDogs(dogsData);
      setStats(statsData);
      setInviteCode(meData.invite_code);

      // Show welcome modal on first visit ever
      const welcomed = localStorage.getItem('pawgress_welcomed_trainer');
      if (!welcomed) setShowWelcome(true);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  function dismissWelcome() {
    setShowWelcome(false);
    localStorage.setItem('pawgress_welcomed_trainer', '1');
  }

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      {showWelcome && <WelcomeModal role="trainer" onDone={dismissWelcome} />}

      <div style={{ marginBottom:28 }}>
        <p className="section-label">Dashboard</p>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'var(--teal)', marginTop:4 }}>
          Hello{user?.firstName ? `, ${user.firstName}` : ''} 👋
        </h1>
        {inviteCode && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginTop:10, background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'8px 16px', boxShadow:'var(--card-shadow)' }}>
            <span style={{ fontSize:12, color:'var(--gray-text)' }}>Your invite code:</span>
            <span style={{ fontWeight:600, fontSize:16, color:'var(--teal)', letterSpacing:'0.12em', fontFamily:'var(--font-serif)' }}>{inviteCode}</span>
            <button onClick={copyCode} style={{
              background: copied ? 'var(--teal)' : 'var(--coral-light)',
              color: copied ? 'white' : 'var(--coral)',
              border:'none', borderRadius:'var(--radius-sm)', padding:'4px 12px',
              fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)',
              transition:'all .2s', fontWeight:500
            }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
        {[
          { label:'Active Dogs', value: dogs.length, sub:`${dogs.length} client${dogs.length!==1?'s':''}` },
          { label:'Sessions This Month', value: stats.sessions_this_month || 0, sub:'logged sessions' },
          { label:'Avg Rating', value: stats.avg_rating ? `${parseFloat(stats.avg_rating).toFixed(1)} ★` : '—', sub:'across all sessions' },
          { label:'Drafts', value: stats.drafts || 0, sub:'unpublished', accent: stats.drafts > 0 },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} style={{ background:'var(--white)', border:`1px solid ${accent ? 'var(--coral)' : 'var(--gray-border)'}`, borderRadius:'var(--radius-md)', padding:'16px 18px', boxShadow:'var(--card-shadow)' }}>
            <div style={{ fontSize:11, color:'var(--gray-text)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:500, color: accent ? 'var(--coral)' : 'var(--brown)', fontFamily:'var(--font-serif)' }}>{value}</div>
            <div style={{ fontSize:11, color:'var(--gray-text)', marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <p className="section-label">Active Dogs</p>
        <button onClick={() => setShowAddDog(true)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'8px 18px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
          + Add Dog
        </button>
      </div>

      {dogs.length === 0 ? (
        <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:48, textAlign:'center', background:'var(--white)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🐶</div>
          <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 6px' }}>No dogs yet</p>
          <p style={{ fontSize:14, color:'var(--gray-text)', margin:'0 0 20px' }}>Add your first client dog to get started</p>
          <button onClick={() => setShowAddDog(true)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'10px 22px', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            + Add Your First Dog
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
          {dogs.map((dog, i) => (
            <div key={dog.id} onClick={() => navigate(`/dogs/${dog.id}`)}
              style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:18, cursor:'pointer', boxShadow:'var(--card-shadow)', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(45,139,114,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray-border)'; e.currentTarget.style.boxShadow='var(--card-shadow)'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: dog.notes ? 10 : 0 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:COLOR_BG[i%COLOR_BG.length], color:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:13, flexShrink:0 }}>
                  {initials(dog.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:16, color:'var(--brown)', fontWeight:500 }}>{dog.name}</div>
                  <div style={{ fontSize:12, color:'var(--gray-text)' }}>{dog.owner_name}{dog.breed ? ` · ${dog.breed}` : ''}</div>
                </div>
                <span className="badge badge-green">Active</span>
              </div>
              {dog.notes && <p style={{ fontSize:12, color:'var(--gray-text)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingTop:8, borderTop:'1px solid var(--cream-dark)' }}>{dog.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showAddDog && <AddDogModal onClose={() => setShowAddDog(false)} onSaved={() => { setShowAddDog(false); loadData(); }} />}
    </div>
  );
}
