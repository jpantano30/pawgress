import { useMemo } from 'react';

function calcImprovement(sessions, metricId, lowerIsBetter) {
  const scored = sessions
    .filter(s => s.scores?.some(sc => sc.metric_id === metricId))
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
  if (scored.length < 2) return null;
  const first = scored[0].scores.find(sc => sc.metric_id === metricId)?.score;
  const last = scored[scored.length-1].scores.find(sc => sc.metric_id === metricId)?.score;
  if (!first || !last) return null;
  const diff = lowerIsBetter ? first - last : last - first;
  const pct = Math.round((diff / first) * 100);
  return { first: parseFloat(first), last: parseFloat(last), pct, improved: diff > 0 };
}

function InsightCard({ emoji, title, value, sub, color }) {
  return (
    <div style={{
      background:'var(--white)', border:`1px solid ${color}40`,
      borderRadius:'var(--radius-md)', padding:'14px 16px',
      boxShadow:'var(--card-shadow)', borderLeft:`3px solid ${color}`
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <span style={{ fontSize:18 }}>{emoji}</span>
        <span style={{ fontSize:12, color:'var(--gray-text)', textTransform:'uppercase', letterSpacing:'.06em' }}>{title}</span>
      </div>
      <div style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--brown)', marginBottom:2 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--gray-text)' }}>{sub}</div>}
    </div>
  );
}

export default function ProgressSummary({ dog, sessions, metrics, cues, homeworkLogs }) {
  const insights = useMemo(() => {
    const cards = [];

    // Sessions count
    if (sessions.length > 0) {
      const firstSession = sessions[sessions.length-1];
      const weeksAgo = Math.round((new Date() - new Date(firstSession.session_date)) / (1000*60*60*24*7));
      cards.push({
        emoji:'📅', title:'Training Journey',
        value:`${sessions.length} session${sessions.length!==1?'s':''}`,
        sub: weeksAgo > 0 ? `over ${weeksAgo} week${weeksAgo!==1?'s':''}` : 'just started!',
        color:'var(--teal)'
      });
    }

    // Best improvement metric
    const improvements = metrics.map(m => ({
      metric: m,
      result: calcImprovement(sessions, m.id, m.lower_is_better)
    })).filter(x => x.result && x.result.improved && x.result.pct > 0)
       .sort((a, b) => b.result.pct - a.result.pct);

    if (improvements.length > 0) {
      const best = improvements[0];
      cards.push({
        emoji:'📈', title:'Biggest Improvement',
        value:`${best.result.pct}% better`,
        sub:`${best.metric.name}: ${best.result.first} → ${best.result.last}`,
        color:'var(--coral)'
      });
    }

    // Mastered cues
    const mastered = cues.filter(c => c.fluency === 5);
    if (mastered.length > 0) {
      cards.push({
        emoji:'🏆', title:'Cues Mastered',
        value: mastered.length,
        sub: mastered.slice(0,3).map(c => c.name).join(', ') + (mastered.length > 3 ? '...' : ''),
        color:'#d97706'
      });
    }

    // Practice streak
    if (homeworkLogs.length > 0) {
      const dates = [...new Set(homeworkLogs.map(l => l.logged_date.split('T')[0]))].sort().reverse();
      let streak = 0;
      let check = new Date().toISOString().split('T')[0];
      for (let i = 0; i < 60; i++) {
        if (dates.includes(check)) {
          streak++;
          const d = new Date(check); d.setDate(d.getDate()-1); check = d.toISOString().split('T')[0];
        } else break;
      }
      if (streak >= 2) {
        cards.push({
          emoji: streak >= 7 ? '🔥' : '⭐',
          title:'Practice Streak',
          value:`${streak} days`,
          sub: streak >= 14 ? 'Outstanding consistency!' : streak >= 7 ? 'Incredible dedication!' : 'Keep it going!',
          color: streak >= 7 ? '#d97706' : 'var(--teal)'
        });
      }
    }

    // Avg rating trend
    const rated = sessions.filter(s => s.overall_rating);
    if (rated.length >= 3) {
      const recent = rated.slice(0, 3);
      const older = rated.slice(3, 6);
      if (older.length > 0) {
        const recentAvg = recent.reduce((a,b) => a + b.overall_rating, 0) / recent.length;
        const olderAvg = older.reduce((a,b) => a + b.overall_rating, 0) / older.length;
        if (recentAvg > olderAvg) {
          cards.push({
            emoji:'⭐', title:'Session Quality',
            value:`${recentAvg.toFixed(1)} avg rating`,
            sub:'Trending up from recent sessions',
            color:'var(--teal)'
          });
        }
      }
    }

    return cards;
  }, [sessions, metrics, cues, homeworkLogs]);

  if (insights.length === 0) return null;

  return (
    <div style={{ marginBottom:24 }}>
      <div className="section-label" style={{ marginBottom:12 }}>Progress Summary</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:10 }}>
        {insights.map((insight, i) => (
          <InsightCard key={i} {...insight} />
        ))}
      </div>
    </div>
  );
}
