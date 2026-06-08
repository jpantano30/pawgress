import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../hooks/useApi';
import AddClientDogModal from '../components/client/AddClientDogModal';

const COLORS = ['var(--teal)','var(--coral)','#185FA5','#993556'];
const COLOR_BG = ['var(--teal-light)','var(--coral-light)','#E6F1FB','#FBEAF0'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

export default function ClientDashboard() {
  const { apiFetch } = useApi();
  const { user } = useUser();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDog, setShowAddDog] = useState(false);

  async function loadDogs() {
    try { setDogs(await apiFetch('/api/dogs')); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDogs(); }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <p className="section-label">My Training</p>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'var(--teal)', marginTop:4 }}>
          {user?.firstName ? `${user.firstName}'s Dogs` : 'My Dogs'}
        </h1>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button onClick={() => setShowAddDog(true)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'9px 18px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
          + Add Dog
        </button>
      </div>

      {dogs.length === 0 ? (
        <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:48, textAlign:'center', background:'var(--white)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🐾</div>
          <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 6px' }}>No dogs yet</p>
          <p style={{ fontSize:14, color:'var(--gray-text)', margin:'0 0 20px' }}>Add your dog to start tracking their training journey.</p>
          <button onClick={() => setShowAddDog(true)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'10px 22px', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            + Add Your Dog
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {dogs.map((dog, i) => (
            <div key={dog.id} onClick={() => navigate(`/dogs/${dog.id}`)}
              style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:20, cursor:'pointer', boxShadow:'var(--card-shadow)', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray-border)'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:COLOR_BG[i%COLOR_BG.length], color:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:16, flexShrink:0 }}>
                  {initials(dog.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:17, fontWeight:500, color:'var(--brown)' }}>{dog.name}</div>
                  {dog.breed && <div style={{ fontSize:13, color:'var(--gray-text)' }}>{dog.breed}</div>}
                  {!dog.trainer_id && <div style={{ fontSize:12, color:'var(--coral)', marginTop:2 }}>Not yet connected to a trainer</div>}
                </div>
                <span style={{ fontSize:13, color:'var(--teal)', fontWeight:500 }}>View progress →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddDog && <AddClientDogModal onClose={() => setShowAddDog(false)} onSaved={() => { setShowAddDog(false); loadDogs(); }} />}
    </div>
  );
}
