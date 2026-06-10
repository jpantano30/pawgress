# Pawgress 🐾

A full-stack dog training management platform for professional trainers and their clients.

Trainers manage client dogs, log sessions, track behavior metrics, write day training reports, and assign homework. Dog owners log in to see their dog's progress, complete their intake form, log daily practice, track their streak, and follow their dog's skill map — all in one place.

**Live demo:** https://pawgress-eight.vercel.app

---

## Screenshots

### Trainer Dashboard
![Trainer Dashboard](./docs/screenshots/dashboard.png)

### Dog Profile & Behavior Charts
![Dog Profile with Charts](./docs/screenshots/charts.png)

### Homework Tracker with Streaks
![Homework Tracker](./docs/screenshots/session.png)

### Client Portal
![Client Portal](./docs/screenshots/client.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Recharts, Vite |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) |
| Auth | Clerk (two-role: trainer / client) |
| Hosting | Vercel (frontend) + Railway (backend) |
| Fonts | Playfair Display + Inter (Google Fonts) |

---

## Features

### Trainer Portal
- Dashboard with active client dogs, session stats, avg rating, draft count
- Unique invite code — clients enter it to connect their account
- Add client dogs with owner info
- Define custom behavior metrics per dog (name, scale, color, direction)
- Log training sessions with behavior scores, notes, homework, star rating, publish/draft control
- **Day training report builder** — opens mid-session, autosaves as you go, fill in sections throughout the day, publish when ready
- **Cue/trick tracker** — add cues per dog, rate fluency from Introduced → Learning → Reliable → Proofed → Mastered
- **Client intake form** — 8-section intake matching Paisley Dog Gear & Training's real intake form. Send clients a shareable link or fill it in yourself
- View client homework completion and streak data
- Progress charts showing behavior trends across sessions

### Client Portal
- Warm first-time welcome walkthrough (4 steps, skippable)
- **Homework tracker** — daily practice log with 7-day calendar grid
- **Streak badges** — 3 days ⭐, 7 days 🔥, 14 days 🏆 with confetti on milestones
- **Progress summary cards** — auto-generated insights like "Leash Reactivity improved 40%", biggest improvement, mastered cues, streak
- **Cue tracker** — clients can add and rate their own cues, not just view trainer's
- View published session reports and session notes
- Fill out intake form directly in the app
- Send practice notes to trainer
- View dog's behavior progress charts

### Both Roles
- Role-based auth — trainers and clients see completely different UIs
- Help guide — role-specific accordion guide accessible from the nav
- Confetti celebrations when logging practice or leveling up a cue

---

## Architecture

```
pawgress/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── trainer/    # LogSessionModal, AddDogModal, EditDogModal, SessionDetail, AddMetricModal
│       │   ├── client/     # HomeworkTracker, AddClientDogModal
│       │   └── shared/     # BehaviorChart, CueTracker, IntakeForm, WelcomeModal, ProgressSummary, Confetti, Layout
│       ├── hooks/          # useRole, useApi
│       └── pages/          # TrainerDashboard, DogProfile, ReportBuilder, TrainerIntakePage
│                             ClientDashboard, ClientDogView, ClientIntakePage, HelpPage
└── server/                 # Express API
    ├── routes/             # dogs, sessions, metrics, users, homework, reports, cues
    ├── middleware/         # requireRole
    └── db/                 # schema.sql + migration files
```

## Database Schema

9 tables: `users`, `trainer_clients`, `dogs`, `behavior_metrics`, `sessions`, `behavior_scores`, `homework_logs`, `session_reports`, `dog_cues`

Key design decisions:
- Users managed by Clerk, mirrored in our DB with `role` and `invite_code` columns
- Trainer invite codes auto-generated on signup (format: `ABC-123`)
- Behavior metrics are fully configurable per dog
- Sessions and behavior scores inserted transactionally
- Session reports store sections as JSONB for flexible day-training format
- Dog intake data stored as JSONB for schema flexibility
- Cue fluency tracked 1-5 with directional labels

---

## Local Development

### Prerequisites
- Node.js 18+
- [Neon](https://neon.tech) PostgreSQL database
- [Clerk](https://clerk.com) application

### Setup

```bash
git clone https://github.com/jpantano30/pawgress.git
cd pawgress

cd server && npm install
cd ../client && npm install

cp .env.example server/.env
cp .env.example client/.env
# Fill in DATABASE_URL, CLERK keys
```

Run all SQL files in `server/db/` in Neon's SQL editor in order:
1. `schema.sql`
2. `add_features.sql`
3. `add_next_session.sql`
4. `add_intake.sql`
5. `add_cues.sql`

```bash
cd server && npm run dev   # :3001
cd client && npm run dev   # :5173
```

### Environment Variables

**server/.env**
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

**client/.env**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
```

---

## Roadmap

- [ ] Email notifications (session published, homework assigned)
- [ ] Mobile-optimized layout
- [ ] PDF session report export
- [ ] Stripe subscription for premium tier
- [ ] Photo uploads for dog profiles
- [ ] Multi-dog household support improvements

---

Built by [Jena Pantano](https://github.com/jpantano30) · [Paisley Dog Gear & Training](https://paisleydoggearandtraining.com)
