import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const COLORS = ['#5B4CF5','#1D9E75','#E24B4A','#D85A30','#185FA5','#993556'];

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
}

export default function ClientDashboard() {
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/dogs')
      .then(setDogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:32, color:'#6b7280' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:600, color:'#111827', margin:0 }}>My Dogs</h1>
        <p style={{ fontSize:14, color:'#6b7280', margin:'4px 0 0' }}>Track your dog's training progress</p>
      </div>

      {dogs.length === 0 ? (
        <div style={{ border:'2px dashed #e5e7eb', borderRadius:12, padding:48, textAlign:'center', color:'#9ca3af' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🐾</div>
          <p style={{ fontSize:15, fontWeight:500, color:'#6b7280', margin:'0 0 6px' }}>No dogs yet</p>
          <p style={{ fontSize:13 }}>Your trainer will add your dog and you'll see their progress here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {dogs.map((dog, i) => (
            <div key={dog.id} onClick={() => navigate(`/dogs/${dog.id}`)}
              style={{
                background:'#fff', border:'1px solid #e5e7eb', borderRadius:14,
                padding:20, cursor:'pointer', transition:'border-color .15s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#5B4CF5'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{
                  width:48, height:48, borderRadius:'50%',
                  background: COLORS[i % COLORS.length] + '18',
                  color: COLORS[i % COLORS.length],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:600, fontSize:16, flexShrink:0
                }}>
                  {dog.photo_url
                    ? <img src={dog.photo_url} alt={dog.name} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover' }}/>
                    : initials(dog.name)
                  }
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16, fontWeight:500, color:'#111827' }}>{dog.name}</div>
                  {dog.breed && <div style={{ fontSize:13, color:'#6b7280' }}>{dog.breed}</div>}
                </div>
                <span style={{ fontSize:13, color:'#5B4CF5' }}>View progress →</span>
              </div>
              {dog.notes && (
                <p style={{ fontSize:13, color:'#9ca3af', margin:'12px 0 0', paddingTop:12, borderTop:'1px solid #f3f4f6' }}>
                  {dog.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
