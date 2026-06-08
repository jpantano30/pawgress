import { useState } from 'react';

function getStreak(logs, sessionId) {
  const dates = logs
    .filter(l => l.session_id === sessionId)
    .map(l => l.logged_date.split('T')[0])
    .sort()
    .reverse();

  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let check = today;

  for (let i = 0; i < 60; i++) {
    if (dates.includes(check)) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().split('T')[0];
    } else if (i === 0) {
      // Today not logged yet — check if yesterday continues streak
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().split('T')[0];
      if (!dates.includes(check)) break;
    } else {
      break;
    }
  }
  return streak;
}

function getLast7Days() {
  return Array.from({ length:7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export default function HomeworkTracker({ dog, sessions, homeworkLogs, onLogUpdated, apiFetch }) {
  const [activeSession, setActiveSession] = useState(sessions[0]?.id || null);
  const [noteText, setNoteText] = useState('');
  const [showNoteFor, setShowNoteFor] = useState(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const last7 = getLast7Days();

  function isLogged(sessionId, date) {
    return homeworkLogs.some(l => l.session_id === sessionId && l.logged_date.split('T')[0] === date);
  }

  function getLog(sessionId, date) {
    return homeworkLogs.find(l => l.session_id === sessionId && l.logged_date.split('T')[0] === date);
  }

  async function toggleDay(session, date) {
    setSaving(true);
    try {
      const existing = getLog(session.id, date);
      if (existing) {
        await apiFetch(`/api/homework/${existing.id}`, { method:'DELETE' });
      } else {
        await apiFetch('/api/homework', {
          method:'POST',
          body: JSON.stringify({ session_id: session.id, dog_id: dog.id, logged_date: date }),
        });
      }
      onLogUpdated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function addNote(session, date) {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/api/homework', {
        method:'POST',
        body: JSON.stringify({ session_id: session.id, dog_id: dog.id, logged_date: date, notes: noteText }),
      });
      setNoteText('');
      setShowNoteFor(null);
      onLogUpdated();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  if (sessions.length === 0) {
    return (
      <div style={{ border:'2px dashed var(--gray-border)', borderRadius:'var(--radius-md)', padding:48, textAlign:'center', background:'var(--white)' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
        <p style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--teal)', margin:'0 0 8px' }}>No homework yet</p>
        <p style={{ fontSize:14, color:'var(--gray-text)', margin:0 }}>Your trainer will assign homework after your first session.</p>
      </div>
    );
  }

  const activeSessionObj = sessions.find(s => s.id === activeSession) || sessions[0];
  const streak = getStreak(homeworkLogs, activeSessionObj?.id);
  const totalPracticed = homeworkLogs.filter(l => l.session_id === activeSessionObj?.id).length;
  const todayLogged = isLogged(activeSessionObj?.id, today);

  return (
    <div>
      {/* Session selector if multiple */}
      {sessions.length > 1 && (
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {sessions.map(s => (
            <button key={s.id} onClick={() => setActiveSession(s.id)} style={{
              padding:'6px 14px', borderRadius:20, border:`1.5px solid ${activeSession===s.id ? 'var(--teal)' : 'var(--gray-border)'}`,
              background: activeSession===s.id ? 'var(--teal-light)' : 'var(--white)',
              color: activeSession===s.id ? 'var(--teal)' : 'var(--gray-text)',
              fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:500
            }}>
              {new Date(s.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
            </button>
          ))}
        </div>
      )}

      {activeSessionObj && (
        <>
          {/* Homework card */}
          <div style={{ background:'var(--teal-light)', border:'1px solid var(--teal)', borderRadius:'var(--radius-md)', padding:'18px 20px', marginBottom:20 }}>
            <div className="section-label" style={{ color:'var(--teal-dark)', marginBottom:6 }}>
              Current Homework · Assigned {new Date(activeSessionObj.session_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
            </div>
            <p style={{ fontSize:15, color:'var(--brown)', margin:0, lineHeight:1.6 }}>{activeSessionObj.homework}</p>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'14px 16px', textAlign:'center', boxShadow:'var(--card-shadow)' }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:28, color: streak >= 3 ? 'var(--coral)' : 'var(--teal)' }}>
                {streak} {streak >= 3 ? '🔥' : ''}
              </div>
              <div style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em' }}>Day Streak</div>
            </div>
            <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'14px 16px', textAlign:'center', boxShadow:'var(--card-shadow)' }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'var(--teal)' }}>{totalPracticed}</div>
              <div style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em' }}>Days Practiced</div>
            </div>
            <div style={{ background: todayLogged ? 'var(--teal-light)' : 'var(--white)', border:`1px solid ${todayLogged ? 'var(--teal)' : 'var(--gray-border)'}`, borderRadius:'var(--radius-md)', padding:'14px 16px', textAlign:'center', boxShadow:'var(--card-shadow)' }}>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:28, color: todayLogged ? 'var(--teal)' : 'var(--gray-text)' }}>
                {todayLogged ? '✓' : '—'}
              </div>
              <div style={{ fontSize:11, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em' }}>Today</div>
            </div>
          </div>

          {/* Today button */}
          {!todayLogged ? (
            <button onClick={() => toggleDay(activeSessionObj, today)} disabled={saving}
              style={{ width:'100%', padding:'16px', borderRadius:'var(--radius-md)', border:'2px dashed var(--teal)', background:'var(--teal-light)', color:'var(--teal)', fontSize:15, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-sans)', marginBottom:20, transition:'all .15s' }}>
              ✓ Mark today as practiced
            </button>
          ) : (
            <div style={{ background:'var(--teal)', borderRadius:'var(--radius-md)', padding:'14px', textAlign:'center', color:'white', fontSize:14, fontWeight:500, marginBottom:20 }}>
              ✓ Today's practice logged! Great work 🎉
            </div>
          )}

          {/* 7-day calendar */}
          <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'16px 20px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
            <div className="section-label" style={{ marginBottom:12 }}>Last 7 days</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
              {last7.map(date => {
                const logged = isLogged(activeSessionObj.id, date);
                const log = getLog(activeSessionObj.id, date);
                const isToday = date === today;
                const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short' }).slice(0,1);
                return (
                  <div key={date} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:10, color:'var(--gray-text)', marginBottom:4, textTransform:'uppercase' }}>{dayLabel}</div>
                    <button onClick={() => toggleDay(activeSessionObj, date)} disabled={saving}
                      title={log?.notes || (logged ? 'Practiced' : 'Not logged')}
                      style={{
                        width:'100%', aspectRatio:'1', borderRadius:'var(--radius-sm)',
                        border: isToday ? '2px solid var(--teal)' : '1px solid var(--gray-border)',
                        background: logged ? 'var(--teal)' : 'var(--cream)',
                        color: logged ? 'white' : 'var(--gray-text)',
                        cursor:'pointer', fontSize:13, fontWeight:logged ? 500 : 400,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        transition:'all .15s'
                      }}>
                      {logged ? '✓' : new Date(date + 'T12:00:00').getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add note */}
          <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'16px 20px', boxShadow:'var(--card-shadow)' }}>
            <div className="section-label" style={{ marginBottom:10 }}>Add a note for your trainer</div>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="How did practice go? Any questions? What went well or was hard?"
              style={{ width:'100%', minHeight:80, padding:'10px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-border)', fontSize:13, fontFamily:'var(--font-sans)', color:'var(--brown)', resize:'vertical', outline:'none' }}
            />
            <button onClick={() => addNote(activeSessionObj, today)} disabled={saving || !noteText.trim()}
              style={{ marginTop:10, padding:'8px 18px', background:'var(--coral)', color:'white', border:'none', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:500, cursor: saving || !noteText.trim() ? 'not-allowed' : 'pointer', opacity: !noteText.trim() ? .5 : 1, fontFamily:'var(--font-sans)' }}>
              {saving ? 'Saving...' : 'Send note'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
