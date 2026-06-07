import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useRole } from '../../hooks/useRole';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { role } = useRole();

  const isTrainer = role === 'trainer';

  return (
    <div style={{ minHeight:'100vh', background:'#f9fafb' }}>
      <nav style={{
        background:'#fff', borderBottom:'1px solid #e5e7eb',
        padding:'0 24px', height:56,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:40
      }}>
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{
          display:'flex', alignItems:'center', gap:8,
          cursor:'pointer', userSelect:'none'
        }}>
          <div style={{
            width:28, height:28, borderRadius:8, background:'#5B4CF5',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14
          }}>🐾</div>
          <span style={{ fontWeight:600, fontSize:15, color:'#111827' }}>Pawgress</span>
        </div>

        {/* Nav links - trainer only */}
        {isTrainer && (
          <div style={{ display:'flex', gap:4 }}>
            {[
              { label:'Dashboard', path:'/' },
            ].map(({ label, path }) => (
              <button key={path} onClick={() => navigate(path)} style={{
                background: location.pathname === path ? '#f3f4f6' : 'none',
                border:'none', borderRadius:8, padding:'6px 14px',
                fontSize:13, color: location.pathname === path ? '#111827' : '#6b7280',
                fontWeight: location.pathname === path ? 500 : 400,
                cursor:'pointer', fontFamily:'inherit'
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {user && (
            <span style={{ fontSize:13, color:'#6b7280' }}>
              {user.firstName || user.primaryEmailAddress?.emailAddress}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <main style={{ padding:'28px 24px', maxWidth:960, margin:'0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
