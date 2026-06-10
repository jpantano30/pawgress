import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

const TRAINER_GUIDE = [
  {
    emoji:'🐾', title:'Add your first client dog',
    content:'From your dashboard, click "+ Add Dog". Enter the dog\'s name, breed, and owner info. Once added, the dog card appears on your dashboard.',
    tip:'You can also let clients add their own dog using your invite code.'
  },
  {
    emoji:'📊', title:'Set up behavior metrics',
    content:'Open a dog\'s profile and go to Progress Charts. Click "+ Add First Metric" to track things like Leash Reactivity, LAT Focus, or Threshold Distance. Choose a scale direction — for reactivity, lower is better.',
    tip:'Add 2-4 metrics per dog for clean, readable charts.'
  },
  {
    emoji:'📝', title:'Log a session',
    content:'From a dog\'s profile, click "+ Log Session". Enter scores for each behavior metric, write a session summary and homework, then publish when you\'re ready for the client to see it.',
    tip:'Save as draft first if you want to review before the client sees it.'
  },
  {
    emoji:'📄', title:'Write a day training report',
    content:'Click "+ Day Report" from a dog\'s profile. This is your live working document — fill in sections as you go throughout the day. It autosaves every few seconds. Publish when done.',
    tip:'Add next session date so your client sees a countdown in their app.'
  },
  {
    emoji:'🎯', title:'Track cues and tricks',
    content:'Go to the Cues tab on any dog profile. Add cues from presets or type your own. Rate fluency from Introduced all the way to Mastered using the dot tracker. Clients can see their dog\'s skill map.',
    tip:'Use the category filter to focus on Obedience, Tricks, Reactivity, etc.'
  },
  {
    emoji:'📋', title:'Send and view intake forms',
    content:'Go to a dog\'s profile → Intake tab. Click "Copy link" and paste it in a text or email to your client. They fill it out in Pawgress. All their answers appear here instantly.',
    tip:'You can also fill it in yourself during an intake call.'
  },
  {
    emoji:'🔗', title:'Your invite code',
    content:'Your invite code is shown on your dashboard (e.g. 42D-FC6). Share it with new clients when they sign up — they enter it to connect their account to yours.',
    tip:'New clients: Sign up → pick Dog Owner → enter your trainer\'s code.'
  },
];

const CLIENT_GUIDE = [
  {
    emoji:'🔗', title:'Connect to your trainer',
    content:'When you sign up, you\'ll be asked for your trainer\'s invite code. Ask your trainer for their 6-character code (like 42D-FC6) and enter it to link your account.',
    tip:'You can also add the code later when adding a new dog.'
  },
  {
    emoji:'🐕', title:'Add your dog',
    content:'From your dashboard, click "+ Add Dog". Enter your dog\'s name and breed. If you have your trainer\'s invite code, add it here to link your dog to their training program.',
    tip:'You can add more than one dog — each gets their own profile and progress tracker.'
  },
  {
    emoji:'📋', title:'Fill out your intake form',
    content:'Your trainer will send you an intake link, or you can find it under your dog\'s Intake tab. Fill it out so your trainer knows your dog\'s history, health info, and goals before you start.',
    tip:'Fill it out as completely as you can — the more your trainer knows, the better they can help.'
  },
  {
    emoji:'📚', title:'Log your daily practice',
    content:'Go to your dog\'s profile → Practice Log tab. You\'ll see your current homework and a 7-day calendar. Tap "Mark today as practiced" after each practice session.',
    tip:'Build a streak! 3 days in a row earns a ⭐, 7 days earns a 🔥.'
  },
  {
    emoji:'💬', title:'Send notes to your trainer',
    content:'At the bottom of the Practice Log, there\'s a notes field. Use it to share how practice is going, ask questions, or flag anything tricky before your next session.',
    tip:'Your trainer sees your notes right on their side.'
  },
  {
    emoji:'📈', title:'See your dog\'s progress',
    content:'The Progress tab shows behavior charts that update after every session. Watch the lines move — things like Reactivity trending down and Focus trending up tell the story of real improvement.',
    tip:'Charts only appear after your trainer has logged sessions with behavior scores.'
  },
  {
    emoji:'📄', title:'Read your session reports',
    content:'After each session your trainer publishes a report, you\'ll see it in the Session Reports tab. It includes notes on what you worked on, wins, and next steps.',
    tip:'Homework from reports appears in your Practice Log automatically.'
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
              <span style={{ color:'var(--gray-text)', fontSize:18, transform: open===i ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>›</span>
            </button>
            {open === i && (
              <div style={{ padding:'0 20px 16px 54px', borderTop:'1px solid var(--cream-dark)' }}>
                <p style={{ fontSize:14, color:'var(--brown)', margin:'12px 0 10px', lineHeight:1.6 }}>{item.content}</p>
                <div style={{ background:'var(--teal-light)', borderRadius:'var(--radius-sm)', padding:'8px 12px', display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ fontSize:14 }}>💡</span>
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
