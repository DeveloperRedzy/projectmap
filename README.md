# ProjectMap

Visual project management for small teams — plan projects as **milestones → outcomes → tasks** on a timeline, collaborate with invited teammates in real time, and track progress on a manager dashboard.

**Live app:** https://projectmap-psi.vercel.app

> Undergraduate final work (thesis) project — Rijad Kuloglija, International Burch University, Department of Information Technology.

## Highlights

- **Full-stack, no custom server** — React SPA on Vercel talking directly to Supabase (PostgreSQL 17, Auth, Realtime); every read/write is authorized by Row Level Security policies in the database.
- **Secure invite-only membership** — managers invite teammates by email; invitations are one-time 256-bit tokens (stored only as SHA-256 hashes) delivered by a Deno edge function, expiring in 7 days, revocable and re-sendable.
- **Realtime collaboration** — task, milestone, and membership changes appear for all project members within about a second, with optimistic updates and rollback on the acting client.
- **Role-based access** — per-project `manager` / `member` roles enforced in the UI *and* in the database.
- **Responsive & accessible** — verified at phone and desktop viewports; touch-reachable controls, visible keyboard focus, reduced-motion support.

## Tech stack

React 18 · Create React App · MUI 5 · Redux Toolkit (auth, projects, members) · TanStack Query 5 (phases, categories, tasks, profiles) · react-router 6 · Supabase (PostgreSQL, Auth, RLS, Realtime, Edge Functions) · Brevo (transactional email) · Vercel · GitHub Actions CI

## Getting started

```bash
cp .env.example .env   # set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
npm install
npm start              # http://localhost:3000
```

Other scripts:

```bash
npm test -- --watchAll=false                            # 58 unit/component tests
npm run build                                           # production build
deno test supabase/functions/send-invite/lib.test.ts    # edge-function tests
```

Registration is invitation-based: the first account in a fresh database is created in the Supabase dashboard (*Authentication → Add user*, auto-confirmed); everyone else joins via in-app invitations.

## Repository layout

```
src/            React application (api layer, state, components, pages, tests)
supabase/       Database schema, RLS policies, RPCs (01…14_*.sql), edge function, SQL tests
.github/        CI workflow (tests + production build)
DOCUMENTATION.md  Full technical documentation (architecture, security model, decisions)
FINALPLAN.md      The phased development plan that drove the build
```

## Documentation

The complete technical documentation — architecture diagrams, database schema, the RLS security model, the invitation protocol, testing and deployment — lives in [DOCUMENTATION.md](./DOCUMENTATION.md).
