import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TRAINER_STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Pawgress!',
    body: "You're all set as a trainer. This is your command center for managing client dogs, tracking progress, and keeping training organized.",
    cta: 'Let\'s get started'
  },
  {
    emoji: '🔗',
    title: 'Share your invite code',
    body: 'Your unique invite code is on your dashboard. Send it to clients when they sign up — they enter it to connect their account to yours.',
    cta: 'Got it'
  },
  {
    emoji: '🐕',
    title: 'Add your first dog',
    body: 'Click "+ Add Dog" on your dashboard to add a client dog. You\'ll enter their name, breed, and owner info. Or let clients add themselves using your invite code.',
    cta: 'Got it'
  },
  {
    emoji: '📊',
    title: 'Track what matters',
    body: 'Log sessions, score behavior metrics, assign homework, and build day training reports as you go. Everything syncs to your client\'s portal in real time.',
    cta: 'Show me my dashboard →'
  },
];

const CLIENT_STEPS = [
  {
    emoji: '🐾',
    title: 'Welcome to Pawgress!',
    body: "This is where you'll track your dog's training journey — practice logs, session notes, progress charts, and your trainer's reports all in one place.",
    cta: 'Let\'s go!'
  },
  {
    emoji: '📚',
    title: 'Log your daily practice',
    body: 'After each practice session, tap "Mark today as practiced" in your dog\'s Practice Log. Build a streak and watch your consistency grow.',
    cta: 'Got it'
  },
  {
    emoji: '💬',
    title: 'Stay connected with your trainer',
    body: 'Send notes from your practice log, fill out your intake form, and check your session reports. Your trainer sees everything in real time.',
    cta: 'Got it'
  },
  {
    emoji: '📈',
    title: 'Watch your dog grow',
    body: 'Progress charts update after every session. Cue trackers show every skill from Introduced to Mastered. You\'ll see exactly how far you\'ve come.',
    cta: 'Take me to my dashboard →'
  },
];

export default function WelcomeModal({ role, onDone }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const steps = role === 'trainer' ? TRAINER_STEPS : CLIENT_STEPS;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  function advance() {
    if (isLast) {
      onDone();
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(61,43,31,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:100
    }}>
      <div style={{
        background:'var(--white)', borderRadius:'var(--radius-lg)',
        padding:'40px 36px', width:460, maxWidth:'90vw',
        boxShadow:'0 20px 60px rgba(61,43,31,0.2)',
        textAlign:'center', position:'relative'
      }}>
        {/* Skip */}
        <button onClick={onDone} style={{
          position:'absolute', top:16, right:16,
          background:'none', border:'none', color:'var(--gray-text)',
          fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)'
        }}>Skip</button>

        {/* Step dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i===step ? 20 : 6, height:6, borderRadius:3,
              background: i===step ? 'var(--teal)' : 'var(--gray-border)',
              transition:'all .3s'
            }}/>
          ))}
        </div>

        <div style={{ fontSize:48, marginBottom:16 }}>{current.emoji}</div>
        <h2 style={{
          fontFamily:'var(--font-serif)', fontSize:24,
          color:'var(--teal)', marginBottom:12
        }}>{current.title}</h2>
        <p style={{
          fontSize:15, color:'var(--brown)', lineHeight:1.65,
          marginBottom:28, maxWidth:360, margin:'0 auto 28px'
        }}>{current.body}</p>

        <button onClick={advance} style={{
          background:'var(--coral)', color:'white', border:'none',
          borderRadius:'var(--radius-sm)', padding:'13px 28px',
          fontSize:15, fontWeight:500, cursor:'pointer',
          fontFamily:'var(--font-sans)', width:'100%',
          transition:'background .15s'
        }}>{current.cta}</button>
      </div>
    </div>
  );
}
