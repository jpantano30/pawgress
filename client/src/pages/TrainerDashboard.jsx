import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import AddDogModal from '../components/trainer/AddDogModal';

const COLORS = ['#5B4CF5','#1D9E75','#E24B4A','#D85A30','#185FA5','#993556'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:'#f3f4f6', borderRadius:10, padding:'14px 18px' }}>
      <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:600, color: color || '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{sub}</div>}
    </div>
  );
}

export default function TrainerDashboard() {
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [stats, setStats] = useState({ sessions_this_month: 0, avg_rating: null, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddDog, setShowAddDog] = useState(false);

  async function loadData() {
    try {
      const [dogsData, statsData] = await Promise.all([
        apiFetch('/api/dogs'),
        apiFetch('/api/sessions/stats'),
      ]);
      setDogs(dogsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return <div style={{ padding:32, color:'#6b7280' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600, color:'#111827', margin:0 }}>Dashboard</h1>
          <p style={{ fontSize:14, color:'#6b7280', margin:'4px 0 0' }}>Your active training clients</p>
        </div>
        <button onClick={() => setShowAddDog(true)} style={{
          background:'#5B4CF5', color:'#fff', border:'none', borderRadius:8,
          padding:'9px 18px', fontSize:14, fontWeight:500, cursor:'pointer'
        }}>+ Add Dog</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
        <StatCard label="Active Dogs" value={dogs.length} sub={`${dogs.length} client${dogs.length !== 1 ? 's' : ''}`} />
        <StatCard label="Sessions This Month" value={stats.sessions_this_month} sub="logged sessions" />
        <StatCard label="Avg Rating" value={stats.avg_rating ? `${parseFloat(stats.avg_rating).toFixed(1)} ★` : '—'} sub="across all sessions" />
        <StatCard label="Drafts" value={stats.drafts} sub="unpublished" color={stats.drafts > 0 ? '#D85A30' : undefined} />
      </div>

      {dogs.length === 0 ? (
        <div style={{ border:'2px dashed #e5e7eb', borderRadius:12, padding:48, textAlign:'center', color:'#9ca3af' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🐶</div>
          <p style={{ fontSize:16, fontWeight:500, color:'#6b7280', margin:'0 0 6px' }}>No dogs yet</p>
          <p style={{ fontSize:14, margin:'0 0 20px' }}>Add your first client dog to get started</p>
          <button onClick={() => setShowAddDog(true)} style={{
            background:'#5B4CF5', color:'#fff', border:'none', borderRadius:8,
            padding:'9px 18px', fontSize:14, fontWeight:500, cursor:'pointer'
          }}>+ Add Your First Dog</button>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize:14, fontWeight:500, color:'#111827', marginBottom:12 }}>Active Dogs</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            {dogs.map((dog, i) => (
              <div key={dog.id} onClick={() => navigate(`/dogs/${dog.id}`)}
                style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, cursor:'pointer', background:'#fff' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#5B4CF5'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:COLORS[i%COLORS.length]+'22', color:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:13, flexShrink:0 }}>
                    {initials(dog.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, fontSize:14 }}>{dog.name}</div>
                    <div style={{ fontSize:12, color:'#6b7280' }}>{dog.owner_name}{dog.breed ? ` · ${dog.breed}` : ''}</div>
                  </div>
                  <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, background:'#dcfce7', color:'#166534' }}>Active</span>
                </div>
                {dog.notes && <p style={{ fontSize:12, color:'#9ca3af', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dog.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {showAddDog && <AddDogModal onClose={() => setShowAddDog(false)} onSaved={() => { setShowAddDog(false); loadData(); }} />}
    </div>
  );
}
