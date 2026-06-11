export function SkeletonCard({ lines = 2 }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:18, boxShadow:'var(--card-shadow)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <div className="skeleton" style={{ width:40, height:40, borderRadius:'50%', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skeleton" style={{ height:14, width:'60%', marginBottom:6 }} />
          <div className="skeleton" style={{ height:12, width:'40%' }} />
        </div>
      </div>
      {Array.from({ length: lines-1 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height:12, width:`${70+i*10}%`, marginBottom:6 }} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
      {Array.from({ length:4 }).map((_, i) => (
        <div key={i} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'16px 18px', boxShadow:'var(--card-shadow)' }}>
          <div className="skeleton" style={{ height:11, width:'70%', marginBottom:10 }} />
          <div className="skeleton" style={{ height:28, width:'40%', marginBottom:6 }} />
          <div className="skeleton" style={{ height:11, width:'55%' }} />
        </div>
      ))}
    </div>
  );
}
