# Pawgress 🐾

A dual-portal dog training curriculum builder.

## Tech Stack
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** Clerk (two-role: trainer / client)
- **Charts:** Recharts
- **File Storage:** Cloudinary
- **Hosting:** Vercel (frontend) + Railway (backend)

## Project Structure
```
pawgress/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       │   ├── trainer/     # Trainer-only UI
│       │   ├── client/      # Client-only UI
│       │   └── shared/      # Shared components
│       ├── pages/
│       ├── hooks/
│       ├── utils/
│       └── context/
└── server/          # Express backend
    ├── routes/
    ├── middleware/
    └── db/
```

## Getting Started
1. `cd client && npm install && npm run dev`
2. `cd server && npm install && npm run dev`
3. Set up `.env` files (see `.env.example`)

## MVP Features
- [ ] Auth + two-role login (Clerk)
- [ ] Dog profiles
- [ ] Trainer dashboard
- [ ] Session logging
- [ ] Behavior charts ← MVP centerpiece
- [ ] Client portal (read view)
- [ ] Homework delivery (premium)
- [ ] PDF reports (premium)
