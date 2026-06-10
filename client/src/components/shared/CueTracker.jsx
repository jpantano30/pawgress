import { useState } from 'react';
import Confetti from '../shared/Confetti';

const FLUENCY_LEVELS = [
  { level:1, label:'Introduced',  color:'#9ca3af', bg:'#f3f4f6', emoji:'🌱' },
  { level:2, label:'Learning',    color:'#d97706', bg:'#fef3c7', emoji:'📚' },
  { level:3, label:'Reliable',    color:'#2563eb', bg:'#dbeafe', emoji:'💪' },
  { level:4, label:'Proofed',     color:'var(--teal)', bg:'var(--teal-light)', emoji:'⭐' },
  { level:5, label:'Mastered',    color:'var(--coral)', bg:'var(--coral-light)', emoji:'🏆' },
];

const PRESET_CUES = {
  'Obedience': ['Sit','Down','Stay','Come','Leave it','Drop it','Heel','Place','Wait','Off'],
  'Leash Skills': ['Loose leash walking','Check-in','Stop/Halt','Side change','Cross behind'],
  'Tricks': ['Paw/Shake','Spin','Roll over','Bow','Wave','Crawl','Back up','Jump'],
  'Reactivity': ['Look at that (LAT)','Find it','Touch/Target','Go to mat','Relax on mat'],
  'Service Skills': ['Perch','Pivot','Orbit','Tuck','Brace','Forward','Under'],
  'Body Awareness': ['Back feet on object','Front feet on object','Nose target','Hip awareness'],
};

const CATEGORIES = Object.keys(PRESET_CUES);

export default function CueTracker({ dog, cues, onCueUpdated, apiFetch, readOnly }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCue, setNewCue] = useState({ name:'', category:'Obedience', fluency:1, notes:'' });
  const [saving, setSaving] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...CATEGORIES.filter(c => cues.some(cu => cu.category === c))];
  const filtered = activeCategory === 'All' ? cues : cues.filter(c => c.category === activeCategory);

  // Group by category
  const grouped = filtered.reduce((acc, cue) => {
    const cat = cue.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cue);
    return acc;
  }, {});

  async function updateFluency(cue, newLevel) {
    if (readOnly) return;
    const wasLevelUp = newLevel > cue.fluency;
    setSaving(true);
    try {
      await apiFetch(`/api/cues/${cue.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ fluency: newLevel }),
      });
      if (wasLevelUp && newLevel >= 4) setJustLeveledUp(cue.name);
      onCueUpdated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function addCue() {
    if (!newCue.name.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/api/cues', {
        method: 'POST',
        body: JSON.stringify({ dog_id: dog.id, ...newCue }),
      });
      setNewCue({ name:'', category:'Obedience', fluency:1, notes:'' });
      setShowAdd(false);
      onCueUpdated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function deleteCue(id) {
    await apiFetch(`/api/cues/${id}`, { method:'DELETE' });
    onCueUpdated();
  }

  const mastered = cues.filter(c => c.fluency === 5).length;
  const proofed = cues.filter(c => c.fluency >= 4).length;
  const inp = { padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-border)', fontSize:13, fontFamily:'var(--font-sans)', color:'var(--brown)', background:'var(--white)', outline:'none' };

  return (
    <div>
      {justLeveledUp && (
        <Confetti message={`${justLeveledUp} leveled up! 🎉`} onDone={() => setJustLeveledUp(null)} />
      )}

      {/* Stats */}
      {cues.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
          {[
            { label:'Total Cues', value: cues.length, emoji:'📋' },
            { label:'Mastered', value: mastered, emoji:'🏆' },
            { label:'Proofed+', value: proofed, emoji:'⭐' },
            { label:'In Progress', value: cues.filter(c=>c.fluency<4).length, emoji:'📚' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'12px 14px', textAlign:'center', boxShadow:'var(--card-shadow)' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{s.emoji}</div>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:22, color:'var(--teal)' }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category filter + Add button */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding:'5px 12px', borderRadius:20, border:`1.5px solid ${activeCategory===cat ? 'var(--teal)' : 'var(--gray-border)'}`,
              background: activeCategory===cat ? 'var(--teal-light)' : 'var(--white)',
              color: activeCategory===cat ? 'var(--teal)' : 'var(--gray-text)',
              fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight: activeCategory===cat ? 500 : 400
            }}>{cat}</button>
          ))}
        </div>
        {!readOnly && (
          <button onClick={() => setShowAdd(s => !s)} style={{ background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', padding:'7px 16px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            + Add Cue
          </button>
        )}
      </div>

      {/* Add cue panel */}
      {showAdd && !readOnly && (
        <div style={{ background:'var(--cream)', border:'1.5px solid var(--teal)', borderRadius:'var(--radius-md)', padding:16, marginBottom:16 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:10 }}>
            <div style={{ flex:2, minWidth:160 }}>
              <div style={{ fontSize:11, color:'var(--gray-text)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>Cue / Trick name</div>
              <input style={{ ...inp, width:'100%' }} value={newCue.name} onChange={e => setNewCue(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Loose leash walking" />
            </div>
            <div style={{ flex:1, minWidth:130 }}>
              <div style={{ fontSize:11, color:'var(--gray-text)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>Category</div>
              <select style={{ ...inp, width:'100%' }} value={newCue.category} onChange={e => setNewCue(n => ({ ...n, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex:1, minWidth:130 }}>
              <div style={{ fontSize:11, color:'var(--gray-text)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>Starting fluency</div>
              <select style={{ ...inp, width:'100%' }} value={newCue.fluency} onChange={e => setNewCue(n => ({ ...n, fluency: parseInt(e.target.value) }))}>
                {FLUENCY_LEVELS.map(f => <option key={f.level} value={f.level}>{f.emoji} {f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Quick-add presets */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'var(--gray-text)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>Quick add from {newCue.category}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {(PRESET_CUES[newCue.category]||[]).filter(p => !cues.some(c => c.name === p)).map(preset => (
                <button key={preset} onClick={() => setNewCue(n => ({ ...n, name: preset }))} style={{
                  padding:'4px 10px', borderRadius:20, border:'1px solid var(--gray-border)',
                  background: newCue.name===preset ? 'var(--teal-light)' : 'var(--white)',
                  color: newCue.name===preset ? 'var(--teal)' : 'var(--gray-text)',
                  fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)'
                }}>{preset}</button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowAdd(false)} style={{ padding:'7px 16px', borderRadius:'var(--radius-sm)', border:'1px solid var(--gray-border)', background:'var(--white)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', color:'var(--brown)' }}>Cancel</button>
            <button onClick={addCue} disabled={saving||!newCue.name.trim()} style={{ padding:'7px 20px', borderRadius:'var(--radius-sm)', border:'none', background: saving||!newCue.name.trim() ? '#9ca3af' : 'var(--teal)', color:'white', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
              {saving ? 'Adding...' : 'Add Cue'}
            </button>
          </div>
        </div>
      )}

      {/* Cue list */}
      {cues.length === 0 ? (
        <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', background:'var(--white)' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🎯</div>
          <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 6px' }}>No cues tracked yet</p>
          <p style={{ fontSize:13, color:'var(--gray-text)', margin:0 }}>
            {readOnly ? 'Your trainer will add cues as you progress.' : 'Add cues and track fluency from Introduced all the way to Mastered.'}
          </p>
        </div>
      ) : Object.entries(grouped).map(([cat, catCues]) => (
        <div key={cat} style={{ marginBottom:20 }}>
          <div className="section-label" style={{ marginBottom:10 }}>{cat}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {catCues.map(cue => {
              const fl = FLUENCY_LEVELS.find(f => f.level === cue.fluency) || FLUENCY_LEVELS[0];
              return (
                <div key={cue.id} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'12px 16px', boxShadow:'var(--card-shadow)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, color:'var(--brown)', marginBottom:2 }}>{cue.name}</div>
                      {cue.notes && <div style={{ fontSize:12, color:'var(--gray-text)' }}>{cue.notes}</div>}
                    </div>

                    {/* Fluency slider */}
                    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                      {FLUENCY_LEVELS.map(f => (
                        <button key={f.level} onClick={() => updateFluency(cue, f.level)} title={f.label}
                          style={{
                            width:28, height:28, borderRadius:'50%', border:`2px solid ${cue.fluency >= f.level ? f.color : 'var(--gray-border)'}`,
                            background: cue.fluency >= f.level ? f.bg : 'var(--white)',
                            cursor: readOnly ? 'default' : 'pointer',
                            fontSize:12, display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all .15s', flexShrink:0
                          }}>
                          {cue.fluency >= f.level ? f.emoji : ''}
                        </button>
                      ))}
                      <span style={{ fontSize:12, color: fl.color, fontWeight:500, minWidth:70, marginLeft:4 }}>{fl.label}</span>
                    </div>

                    {!readOnly && (
                      <button onClick={() => deleteCue(cue.id)} style={{ background:'none', border:'none', color:'var(--gray-text)', cursor:'pointer', fontSize:16, padding:'0 2px', opacity:.5 }}>×</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
