# Pawgress 🐾

A full-stack dog training management platform for professional trainers and their clients.

Trainers log sessions, track behavior metrics, and share progress reports. Dog owners log in to see their dog's progress charts, session notes, and homework — all in one place.

**Live demo:** _coming soon_

---

## Screenshots

### Trainer Dashboard
Manage all active client dogs, view session counts, and add new clients.

![Trainer Dashboard](./docs/screenshots/dashboard.png)

### Dog Profile & Behavior Charts
Track custom behavior metrics over time with interactive line charts. Add metrics like Leash Reactivity, LAT Focus, Threshold Distance, and more.

![Dog Profile with Charts](./docs/screenshots/charts.png)

### Session Logging
Log training sessions with behavior scores, session summary, and homework. Publish to share with the client or save as a draft.

![Log Session](./docs/screenshots/session.png)

### Client Portal
Dog owners log in to see their dog's progress chart, published session notes, and current homework — no trainer access required.

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

---

## Features

**Trainer portal**
- Dashboard with all active client dogs
- Add dogs with owner info
- Define custom behavior metrics per dog (name, scale, color, direction)
- Log training sessions with scores, notes, homework, star rating
- Publish/draft control — trainers choose what clients see
- Progress charts showing behavior trends across sessions

**Client portal**
- View dog's behavior progress charts
- Read published session summaries
- See current homework assignment
- Clean read-only experience

**Under the hood**
- Role-based auth — trainers and clients see completely different UIs
- JWT authentication via Clerk
- Relational PostgreSQL schema with proper foreign keys and indexes
- Transactional session inserts (session + scores in one atomic operation)
- Soft deletes on metrics

---

## Local Development

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) application

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/pawgress.git
cd pawgress

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
cp .env.example server/.env
cp .env.example client/.env
# Fill in your Neon DATABASE_URL and Clerk API keys

# Run the database schema
# Open server/db/schema.sql and run it in your Neon SQL editor

# Start both servers
cd server && npm run dev   # runs on :3001
cd client && npm run dev   # runs on :5173
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

## Database Schema

7 tables: `users`, `trainer_clients`, `dogs`, `behavior_metrics`, `sessions`, `behavior_scores`, `skills`

Key design decisions:
- Users are managed by Clerk but mirrored in our own `users` table with a `role` column
- Behavior metrics are configurable per dog — trainers define what they track
- Sessions and scores are inserted transactionally
- `is_published` flag on sessions controls client visibility

---

## Project Structure

```
pawgress/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── trainer/    # Trainer-only components
│       │   ├── client/     # Client-only components
│       │   └── shared/     # BehaviorChart, Layout
│       ├── hooks/          # useRole, useApi
│       └── pages/          # TrainerDashboard, DogProfile, ClientDogView...
└── server/                 # Express API
    ├── routes/             # dogs, sessions, metrics, users
    ├── middleware/         # requireRole
    └── db/                 # schema.sql, pool.js
```

---

## Roadmap

- [ ] PDF session report generation
- [ ] Email homework delivery to clients
- [ ] Curriculum builder (skill progression trees)
- [ ] Photo uploads for dog profiles
- [ ] Mobile-responsive layout
- [ ] Stripe subscription for premium tier

---

Built by [Jena Pantano](https://github.com/jenapantano) · [Paisley Dog Gear & Training](https://www.instagram.com/paisleydoggearandtraining)
