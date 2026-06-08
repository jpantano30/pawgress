import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const DEFAULT_SECTIONS = [
  { title:'What we worked on today', content:'' },
  { title:'How the dog did', content:'' },
  { title:'Breakthroughs & wins', content:'' },
  { title:'Areas to continue building', content:'' },
];

export default function ReportBuilder() {
  const { dogId, reportId } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  const [report, setReport] = useState(null);
  const [dog, setDog] = useState(null);
  const [form, setForm] = useState({
    title: '',
    report_date: new Date().toISOString().split('T')[0],
    sections: DEFAULT_SECTIONS,
    overall_notes: '',
    homework: '',
    next_session: '',
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const autosaveTimer = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const dogData = await apiFetch(`/api/dogs/${dogId}`);
        setDog(dogData);
        if (reportId && reportId !== 'new') {
          const reportData = await apiFetch(`/api/reports/${reportId}`);
          setReport(reportData);
          setForm({
            title: reportData.title || '',
            report_date: reportData.report_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            sections: reportData.sections || DEFAULT_SECTIONS,
            overall_notes: reportData.overall_notes || '',
            homework: reportData.homework || '',
            next_session: reportData.next_session?.split('T')[0] || '',
          });
        } else {
          setForm(f => ({ ...f, title: `${dogData.name} — Session Report` }));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [dogId, reportId]);

  const autosave = useCallback(async (data) => {
    if (!data.title?.trim()) return;
    setSaving(true);
    try {
      if (report?.id) {
        await apiFetch(`/api/reports/${report.id}`, { method:'PATCH', body: JSON.stringify(data) });
      } else {
        const created = await apiFetch('/api/reports', { method:'POST', body: JSON.stringify({ dog_id: dogId, ...data }) });
        setReport(created);
        // Update URL without reload
        window.history.replaceState(null, '', `/dogs/${dogId}/reports/${created.id}`);
      }
      setLastSaved(new Date());
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }, [report, dogId]);

  function setField(key, val) {
    const updated = { ...form, [key]: val };
    setForm(updated);
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => autosave(updated), 1500);
  }

  function setSection(i, key, val) {
    const sections = form.sections.map((s, idx) => idx===i ? { ...s, [key]: val } : s);
    setField('sections', sections);
  }

  function addSection() {
    setField('sections', [...form.sections, { title:'', content:'' }]);
  }

  function removeSection(i) {
    setField('sections', form.sections.filter((_, idx) => idx !== i));
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await autosave(form);
      if (report?.id) {
        await apiFetch(`/api/reports/${report.id}`, { method:'PATCH', body: JSON.stringify({ status:'published' }) });
      }
      navigate(`/dogs/${dogId}`);
    } catch (err) { console.error(err); }
    finally { setPublishing(false); }
  }

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:'var(--radius-sm)',
    border:'1.5px solid var(--gray-border)', fontSize:14, outline:'none',
    fontFamily:'var(--font-sans)', color:'var(--brown)', background:'var(--white)',
    transition:'border-color .15s'
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div style={{ maxWidth:740, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <button onClick={() => navigate(`/dogs/${dogId}`)} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', display:'flex', alignItems:'center', gap:4 }}>
          ← Back to {dog?.name}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {lastSaved && <span style={{ fontSize:12, color:'var(--gray-text)' }}>Saved {lastSaved.toLocaleTimeString()}</span>}
          {saving && <span style={{ fontSize:12, color:'var(--teal)' }}>Saving...</span>}
          <button onClick={() => autosave(form)} disabled={saving} style={{ padding:'7px 16px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-border)', background:'var(--white)', fontSize:13, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>
            Save Draft
          </button>
          <button onClick={handlePublish} disabled={publishing} style={{ padding:'8px 20px', borderRadius:'var(--radius-sm)', border:'none', background:'var(--teal)', color:'white', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            {publishing ? 'Publishing...' : 'Publish to Client →'}
          </button>
        </div>
      </div>

      {report?.status === 'published' && (
        <div style={{ background:'var(--teal-light)', border:'1px solid var(--teal)', borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:16, fontSize:13, color:'var(--teal-dark)' }}>
          ✓ This report is published and visible to the client.
        </div>
      )}

      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'28px 32px', boxShadow:'var(--card-shadow)', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ flex:2 }}>
            <label style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>Report Title</label>
            <input style={{ ...inp, fontFamily:'var(--font-serif)', fontSize:18 }} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Lulu — Day Training Report" />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:6 }}>Date</label>
            <input style={inp} type="date" value={form.report_date} onChange={e => setField('report_date', e.target.value)} />
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="section-label" style={{ marginBottom:14 }}>Training Notes</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {form.sections.map((section, i) => (
              <div key={i} style={{ background:'var(--cream)', borderRadius:'var(--radius-sm)', padding:'14px 16px', position:'relative' }}>
                <input style={{ ...inp, background:'transparent', border:'none', padding:'0 0 6px', fontWeight:500, fontSize:13, borderBottom:'1px solid var(--gray-border)', borderRadius:0, marginBottom:8 }}
                  value={section.title} onChange={e => setSection(i, 'title', e.target.value)}
                  placeholder="Section heading..." />
                <textarea value={section.content} onChange={e => setSection(i, 'content', e.target.value)}
                  placeholder="Add notes here... you can come back and fill this in throughout the day."
                  style={{ ...inp, background:'transparent', border:'none', padding:0, resize:'vertical', minHeight:80, borderRadius:0 }}
                />
                {form.sections.length > 1 && (
                  <button onClick={() => removeSection(i)} style={{ position:'absolute', top:10, right:12, background:'none', border:'none', color:'var(--gray-text)', cursor:'pointer', fontSize:16 }}>×</button>
                )}
              </div>
            ))}
            <button onClick={addSection} style={{ alignSelf:'flex-start', padding:'7px 16px', borderRadius:'var(--radius-sm)', border:'1.5px dashed var(--gray-border)', background:'none', fontSize:13, cursor:'pointer', color:'var(--gray-text)', fontFamily:'var(--font-sans)' }}>
              + Add section
            </button>
          </div>
        </div>

        {/* Overall notes */}
        <div>
          <label style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:8 }}>Overall Notes</label>
          <textarea value={form.overall_notes} onChange={e => setField('overall_notes', e.target.value)}
            placeholder="General impressions, context, anything else worth noting..."
            style={{ ...inp, resize:'vertical', minHeight:80 }} />
        </div>

        {/* Homework */}
        <div style={{ background:'var(--teal-light)', borderRadius:'var(--radius-md)', padding:'16px 18px' }}>
          <label style={{ fontSize:11, color:'var(--teal-dark)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:8 }}>Homework for Client</label>
          <textarea value={form.homework} onChange={e => setField('homework', e.target.value)}
            placeholder="What should they practice before the next session? Be specific — the client will see this and can log their daily practice."
            style={{ ...inp, resize:'vertical', minHeight:80, background:'var(--white)' }} />
        </div>

        {/* Next session */}
        <div>
          <label style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:8 }}>Next Session Date</label>
          <input style={{ ...inp, maxWidth:200 }} type="date" value={form.next_session} onChange={e => setField('next_session', e.target.value)} />
          <p style={{ fontSize:12, color:'var(--gray-text)', margin:'6px 0 0' }}>Shows as a countdown on the client's portal.</p>
        </div>
      </div>
    </div>
  );
}
