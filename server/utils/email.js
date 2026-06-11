import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Pawgress <notifications@pawgress.app>';
const APP_URL = process.env.CLIENT_URL || 'https://pawgress-eight.vercel.app';

async function send(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

function baseTemplate(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;background:#F5F0EB;font-family:-apple-system,sans-serif}.wrap{max-width:520px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #DDD5CC}.header{background:#2D8B72;padding:24px 28px}.header h1{color:#fff;margin:0;font-size:20px;font-weight:500}.header p{color:#c8ede6;margin:4px 0 0;font-size:13px}.body{padding:28px}.body p{color:#3D2B1F;font-size:15px;line-height:1.6;margin:0 0 14px}.cta{display:block;background:#D4674A;color:#fff;text-decoration:none;border-radius:8px;padding:13px 24px;font-size:15px;font-weight:500;text-align:center;margin:20px 0}.note{font-size:12px;color:#9ca3af;border-top:1px solid #F5F0EB;padding-top:16px;margin-top:8px}.dog-card{background:#F5F0EB;border-radius:8px;padding:14px 16px;margin:16px 0}</style></head><body><div class="wrap"><div class="header"><h1>🐾 Pawgress</h1><p>Paisley Dog Gear &amp; Training</p></div><div class="body">${content}</div></div></body></html>`;
}

export async function sendSessionPublished({ clientEmail, clientName, dogName, trainerName, sessionDate, homework }) {
  const date = new Date(sessionDate).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
  await send(clientEmail, `Session notes ready for ${dogName} 🐾`, baseTemplate(`
    <p>Hi ${clientName || 'there'},</p>
    <p>Your trainer <strong>${trainerName}</strong> just published a session report for <strong>${dogName}</strong>.</p>
    <div class="dog-card"><strong>${dogName}</strong> &middot; ${date}</div>
    ${homework ? `<p><strong>Homework:</strong> ${homework}</p>` : ''}
    <a href="${APP_URL}" class="cta">View session notes in Pawgress &rarr;</a>
    <p class="note">Log your daily practice to build your streak and keep the momentum going.</p>
  `));
}

export async function sendReportPublished({ clientEmail, clientName, dogName, trainerName, reportTitle, homework, nextSession }) {
  const nextDate = nextSession ? new Date(nextSession).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }) : null;
  await send(clientEmail, `Training report ready for ${dogName} 🐾`, baseTemplate(`
    <p>Hi ${clientName || 'there'},</p>
    <p><strong>${trainerName}</strong> published a day training report for <strong>${dogName}</strong>.</p>
    <div class="dog-card"><strong>${reportTitle}</strong></div>
    ${homework ? `<p><strong>Homework:</strong> ${homework}</p>` : ''}
    ${nextDate ? `<p><strong>Next session:</strong> ${nextDate}</p>` : ''}
    <a href="${APP_URL}" class="cta">Read the full report &rarr;</a>
    <p class="note">Check your Practice Log to start tracking daily homework.</p>
  `));
}

export async function sendHomeworkAssigned({ clientEmail, clientName, dogName, homework }) {
  await send(clientEmail, `New homework for ${dogName} 🐾`, baseTemplate(`
    <p>Hi ${clientName || 'there'},</p>
    <p>New homework has been assigned for <strong>${dogName}</strong>.</p>
    <div class="dog-card"><strong>Your homework:</strong><br/><span>${homework}</span></div>
    <a href="${APP_URL}" class="cta">Log your daily practice &rarr;</a>
    <p class="note">Tap "Mark today as practiced" in your dog's Practice Log after each session.</p>
  `));
}

export async function sendIntakeCompleted({ trainerEmail, trainerName, clientName, dogName }) {
  await send(trainerEmail, `Intake completed for ${dogName} 🐾`, baseTemplate(`
    <p>Hi ${trainerName || 'there'},</p>
    <p><strong>${clientName}</strong> just completed the intake form for <strong>${dogName}</strong>.</p>
    <div class="dog-card"><strong>${dogName}</strong> &middot; Intake submitted</div>
    <a href="${APP_URL}" class="cta">View intake in Pawgress &rarr;</a>
    <p class="note">All their answers are now on the dog's profile under the Intake tab.</p>
  `));
}
