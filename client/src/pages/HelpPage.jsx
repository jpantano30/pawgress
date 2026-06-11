import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

const TRAINER_GUIDE = [
  {
    emoji:'🔗', title:'Your invite code',
    content:'Your unique invite code is shown on your dashboard (e.g. 42D-FC6). Share it with new clients when they sign up — they enter it to connect their account to yours. This links all their dogs to your trainer profile automatically.',
    tip:'Text your clients both their trainer invite code AND their dog code when they sign up.'
  },
  {
    emoji:'🐕', title:'Add a client dog',
    content:'From your dashboard, click "+ Add Dog". Enter the dog\'s name, breed, owner name and email. Once saved, the dog gets a unique dog code (shown on its profile) that you can share with the owner so they can claim it when they sign up.',
    tip:'Every dog gets a code like PAI-X4K visible on their profile. Copy it and send it to your client.'
  },
  {
    emoji:'🔑', title:'Dog codes — preventing duplicates',
    content:'Each dog has its own unique code shown on their profile page. When a client signs up and adds their dog, they can enter this code to claim the existing dog record instead of creating a duplicate. No merging needed.',
    tip:'Always share the dog code when onboarding a new client whose dog you\'ve already added.'
  },
  {
    emoji:'📊', title:'Set up behavior metrics',
    content:'Open a dog\'s profile and go to Progress Charts. Click "+ Add First Metric" to track things like Leash Reactivity, LAT Focus, or Threshold Distance. Choose a scale direction — for reactivity, lower is better.',
    tip:'Add 2-4 metrics per dog for clean, readable charts.'
  },
  {
    emoji:'📝', title:'Log a session',
    content:'From a dog\'s profile, click "+ Log Session". Enter scores for each behavior metric, write a session summary and homework, then publish when you\'re ready for the client to see it. Save as draft to review first.',
    tip:'Publishing a session automatically emails the client with their session notes and homework.'
  },
  {
    emoji:'📄', title:'Write a day training report',
    content:'Click "+ Day Report" from a dog\'s profile. This is your live working document — fill in sections as you go throughout the day. It autosaves every few seconds so nothing gets lost. Publish when done.',
    tip:'Add a next session date and it shows as a countdown in your client\'s app.'
  },
  {
    emoji:'🎯', title:'Track cues and tricks',
    content:'Go to the Cues tab on any dog profile. Add cues from presets or type your own. Rate fluency from Introduced → Learning → Reliable → Proofed → Mastered using the dot tracker. A confetti animation fires when a cue levels up to Proofed or Mastered.',
    tip:'Clients can also add and rate their own cues — great for tracking at-home practice.'
  },
  {
    emoji:'📋', title:'Client intake forms',
    content:'Go to a dog\'s profile → Intake tab. Click "Copy link" and paste it in a text or email to your client. They fill out all 8 sections in Pawgress and you see their answers instantly. You can also fill it in yourself or edit their answers.',
    tip:'You\'ll get an email notification when a client completes their intake.'
  },
];

const CLIENT_GUIDE = [
  {
    emoji:'🔗', title:'Connect to your trainer',
    content:'When you sign up, you\'ll be asked for your trainer\'s invite code — a 6-character code like 42D-FC6. Ask your trainer for it and enter it to link your account. This connects you to their training program.',
    tip:'Your trainer may also give you a dog code (like PAI-X4K) — keep that handy for the next step.'
  },
  {
    emoji:'🐕', title:'Add your dog',
    content:'From your dashboard, click "+ Add Dog". You\'ll be asked if your trainer already has your dog in Pawgress. If yes, enter your dog code to claim the existing record. If no, add a new dog with your trainer\'s invite code to connect them.',
    tip:'Using the dog code prevents creating a duplicate record — your trainer\'s session history stays attached to your dog.'
  },
  {
    emoji:'📋', title:'Fill out your intake form',
    content:'Your trainer will send you an intake link, or find it under your dog\'s Intake tab. Fill out all 8 sections — health info, training history, behavior, goals, and more. Your trainer sees everything instantly.',
    tip:'The more you fill in, the better your trainer can prepare for your first session.'
  },
  {
    emoji:'📚', title:'Log your daily practice',
    content:'Go to your dog\'s profile → Practice Log tab. You\'ll see your current homework assignment and a 7-day calendar. Tap "Mark today as practiced" after each practice session. Your streak counter tracks consecutive days.',
    tip:'3 days in a row earns ⭐, 7 days earns 🔥, 14 days earns 🏆. Confetti fires on your first log of the day!'
  },
  {
    emoji:'💬', title:'Send notes to your trainer',
    content:'At the bottom of the Practice Log, there\'s a notes field. Use it to share how practice is going, ask questions, or flag anything tricky. Your trainer sees these notes right on their side of the app.',
    tip:'Notes are tied to specific homework assignments so your trainer has context.'
  },
  {
    emoji:'🎯', title:'Track your dog\'s cues',
    content:'The Cues tab shows every skill your dog is working on, from Introduced all the way to Mastered. Your trainer adds cues as you progress, and you can add your own too. Tap the dots to update fluency ratings.',
    tip:'Watching cues move from Learning to Mastered is one of the most satisfying parts of the app.'
  },
  {
    emoji:'📈', title:'See your dog\'s progress',
    content:'The Progress tab shows behavior charts that update after every session, plus a summary card showing your biggest improvement, mastered cues, and streak. Charts only appear after your trainer logs sessions with behavior scores.',
    tip:'The progress summary auto-calculates percentage improvements — "Leash Reactivity improved 40%" is generated from real session data.'
  },
  {
    emoji:'📄', title:'Read your session reports',
    content:'After each session your trainer publishes notes or a day training report, you\'ll get an email and see it in the Session Reports tab. It includes what you worked on, wins, homework, and your next session date.',
    tip:'You\'ll also get an email when new homework is assigned so you never miss it.'
  },
];

export default function HelpPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [open, setOpen] = useState(null);
  const guide = role === 'trainer' ? TRAINER_GUIDE : CLIENT_GUIDE;
  const title = role === 'trainer' ? 'Trainer Guide' : 'Getting Started';

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'var(--gray-text)', fontSize:13, cursor:'pointer', padding:'0 0 20px', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-sans)' }}>
        ← Back
      </button>

      <div style={{ marginBottom:28 }}>
        <p className="section-label">Help</p>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, color:'var(--teal)', marginTop:4 }}>{title}</h1>
        <p style={{ fontSize:14, color:'var(--gray-text)', marginTop:6 }}>
          {role === 'trainer'
            ? 'Everything you need to know to get the most out of Pawgress with your clients.'
            : 'Learn how to use Pawgress to track your dog\'s training journey.'}
        </p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {guide.map((item, i) => (
          <div key={i} style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', boxShadow:'var(--card-shadow)', overflow:'hidden' }}>
            <button onClick={() => setOpen(open===i ? null : i)} style={{
              width:'100%', padding:'16px 20px', background:'none', border:'none',
              display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left', fontFamily:'var(--font-sans)'
            }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{item.emoji}</span>
              <span style={{ flex:1, fontFamily:'var(--font-serif)', fontSize:16, color:'var(--brown)', fontWeight:500 }}>{item.title}</span>
              <span style={{ color:'var(--gray-text)', fontSize:18, transform: open===i ? 'rotate(90deg)' : 'none', transition:'transform .2s' }}>›</span>
            </button>
            {open === i && (
              <div style={{ padding:'0 20px 16px 54px', borderTop:'1px solid var(--cream-dark)' }}>
                <p style={{ fontSize:14, color:'var(--brown)', margin:'12px 0 10px', lineHeight:1.6 }}>{item.content}</p>
                <div style={{ background:'var(--teal-light)', borderRadius:'var(--radius-sm)', padding:'8px 12px', display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
                  <p style={{ fontSize:13, color:'var(--teal-dark)', margin:0, lineHeight:1.5 }}>{item.tip}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop:28, background:'var(--teal-light)', border:'1px solid var(--teal)', borderRadius:'var(--radius-md)', padding:'18px 20px', textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-serif)', fontSize:16, color:'var(--teal)', margin:'0 0 6px' }}>Questions or feedback?</p>
        <p style={{ fontSize:13, color:'var(--teal-dark)', margin:0 }}>
          Email <a href="mailto:paisleygearandtraining@gmail.com" style={{ color:'var(--teal)' }}>paisleygearandtraining@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
