import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import IntakeForm from '../components/shared/IntakeForm';

export default function TrainerIntakePage() {
  const { dogId } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <p className="section-label">Client Intake</p>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:26, color:'var(--teal)', marginTop:4 }}>{dog.name}</h1>
          {dog.intake_completed_at ? (
            <p style={{ fontSize:12, color:'var(--gray-text)', marginTop:4 }}>
              Submitted {new Date(dog.intake_completed_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
            </p>
          ) : (
            <p style={{ fontSize:12, color:'var(--coral)', marginTop:4 }}>Intake not yet submitted by client</p>
          )}
        </div>
        <button onClick={() => setEditing(e => !e)} style={{ background: editing ? 'var(--white)' : 'var(--teal)', color: editing ? 'var(--brown)' : 'white', border:`1.5px solid ${editing ? 'var(--gray-border)' : 'var(--teal)'}`, borderRadius:'var(--radius-sm)', padding:'8px 18px', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
          {editing ? 'Cancel editing' : dog.intake_data ? 'Edit intake' : 'Fill in for client'}
        </button>
      </div>

      {!dog.intake_data && !editing ? (
        <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:48, textAlign:'center', background:'var(--white)' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
          <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 8px' }}>No intake yet</p>
          <p style={{ fontSize:14, color:'var(--gray-text)', margin:'0 0 16px' }}>
            Send your client this link so they can fill out their intake form. They'll log in to Pawgress and land directly on the form.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--cream)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:20 }}>
            <span style={{ fontSize:13, color:'var(--gray-text)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {window.location.origin}/dogs/{dogId}/intake
            </span>
            <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/dogs/${dogId}/intake`);
              alert('Link copied! Paste it in a text or email to your client.');
            }} style={{ background:'var(--teal)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'7px 16px', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', flexShrink:0 }}>
              Copy link
            </button>
          </div>
          <button onClick={() => setEditing(true)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'10px 22px', fontSize:14, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            Fill in myself
          </button>
        </div>
      ) : (
        <IntakeForm
          dog={dog}
          existingData={dog.intake_data}
          onSaved={() => { setEditing(false); apiFetch(`/api/dogs/${dogId}`).then(setDog); }}
          onCancel={() => setEditing(false)}
          readOnly={!editing}
        />
      )}
    </div>
  );
}
