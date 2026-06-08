import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import IntakeForm from '../components/shared/IntakeForm';

export default function ClientIntakePage() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/dogs/${dogId}`)
      .then(setDog)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dogId]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!dog) return <div style={{ padding:32 }}>Dog not found.</div>;

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <button onClick={() => navigate(`/dogs/${dogId}`)} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', padding:'0 0 20px', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-sans)' }}>
        ← Back to {dog.name}
      </button>

      <div style={{ marginBottom:24 }}>
        <p className="section-label">Intake Form</p>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--teal)', marginTop:4 }}>{dog.name}</h1>
        {dog.intake_completed_at && (
          <p style={{ fontSize:12, color:'var(--gray-text)', marginTop:4 }}>
            Last updated {new Date(dog.intake_completed_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
          </p>
        )}
      </div>

      <IntakeForm
        dog={dog}
        existingData={dog.intake_data}
        onSaved={() => navigate(`/dogs/${dogId}`)}
        onCancel={() => navigate(`/dogs/${dogId}`)}
        readOnly={false}
      />
    </div>
  );
}
