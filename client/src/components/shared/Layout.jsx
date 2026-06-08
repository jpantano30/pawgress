import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useRole } from '../../hooks/useRole';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { role } = useRole();

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <nav style={{
        background:'var(--white)',
        borderBottom:'1px solid var(--gray-border)',
        padding:'0 32px',
        height:60,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        position:'sticky',
        top:0,
        zIndex:40,
        boxShadow:'0 1px 3px rgba(61,43,31,0.06)'
      }}>
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
          <span style={{ fontSize:22 }}>🐾</span>
          <span style={{ fontFamily:'var(--font-serif)', fontWeight:500, fontSize:17, color:'var(--brown)' }}>Pawgress</span>
        </div>

        {role === 'trainer' && (
          <div style={{ display:'flex', gap:2 }}>
            {[{ label:'Dashboard', path:'/' }].map(({ label, path }) => (
              <button key={path} onClick={() => navigate(path)} style={{
                background: location.pathname === path ? 'var(--teal-light)' : 'none',
                border:'none', borderRadius:'var(--radius-sm)', padding:'6px 16px',
                fontSize:13, color: location.pathname === path ? 'var(--teal)' : 'var(--gray-text)',
                fontWeight: location.pathname === path ? 500 : 400,
                cursor:'pointer', fontFamily:'var(--font-sans)',
                transition:'all .15s'
              }}>{label}</button>
            ))}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {user && (
            <span style={{ fontSize:13, color:'var(--gray-text)' }}>
              {user.firstName || user.primaryEmailAddress?.emailAddress}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main style={{ padding:'32px 24px', maxWidth:960, margin:'0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
