export default function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <span>⚠️</span>
      <span style={{ flex:1 }}>{error}</span>
      {onRetry && (
        <button onClick={onRetry} style={{ background:'none', border:'1px solid #fca5a5', borderRadius:6, padding:'3px 10px', fontSize:12, color:'#b91c1c', cursor:'pointer', fontFamily:'var(--font-sans)', flexShrink:0 }}>
          Retry
        </button>
      )}
    </div>
  );
}
