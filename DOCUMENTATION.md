# ProjectMap — Technical Documentation

> **Author:** Rijad Kuloglija
> **Student No:** 19002119
> **Institution:** International Burch University — Department of Information Technology
> **Academic Year:** 2025/2026
> **Live application:** https://projectmap-psi.vercel.app
> **Document status:** Describes the final, deployed system (last updated August 2026)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [State Management](#5-state-management)
6. [Routing & Access Control](#6-routing--access-control)
7. [Backend: Database Schema](#7-backend-database-schema)
8. [Backend: Security Model (RLS)](#8-backend-security-model-rls)
9. [Authentication & the Invitation System](#9-authentication--the-invitation-system)
10. [Realtime Collaboration](#10-realtime-collaboration)
11. [Roles & Permissions](#11-roles--permissions)
12. [Error Handling & UX States](#12-error-handling--ux-states)
13. [Responsive Design & Accessibility](#13-responsive-design--accessibility)
14. [Testing](#14-testing)
15. [Deployment & Operations](#15-deployment--operations)
16. [Project Structure](#16-project-structure)
17. [Running the Project](#17-running-the-project)
18. [Design Decisions & Trade-offs](#18-design-decisions--trade-offs)
19. [Known Limitations & Future Work](#19-known-limitations--future-work)

---

## 1. Project Overview

**ProjectMap** is a full-stack, multi-user project management application. Teams plan projects visually as a hierarchy — **projects → milestones (phases) → outcomes (categories) → tasks** — assign and complete tasks, discuss them in comment threads, and monitor progress on an aggregated manager dashboard. All changes synchronize between users in real time.

### Core capabilities

| Feature | Description |
|---------|-------------|
| Visual project mapping | Projects broken into milestones with due dates, outcomes, and tasks on a horizontal timeline |
| Team collaboration | Invite-only membership per project with `manager` / `member` roles |
| Secure invitations | Tokenized, expiring email invitations delivered via an edge function |
| Task workflow | Create, edit, move, assign, complete (with who/when tracking), delete |
| Task comments | Per-task discussion threads; authors can edit and delete their own comments |
| Manager dashboard | Deadline indicators, progress aggregation, task table with filters — only for projects the user manages |
| Realtime sync | Changes by one user appear for all project members without refresh |
| Profiles | Name and avatar, with a guided first-login setup |

### Evolution

The application began as a client-only prototype persisting to browser `localStorage`. It was rebuilt in four phases into a production system backed by **Supabase** (PostgreSQL, Auth, Row Level Security, Realtime, Edge Functions), deployed on **Vercel**. This document describes the final system; the phase plan that drove the work is preserved in `FINALPLAN.md`.

---

## 2. Technology Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| UI framework | React | 18.2 | Component-based SPA |
| Build toolchain | Create React App (react-scripts) | 5.0.1 | Build, dev server, Jest runner |
| Component library | Material-UI (MUI) | 5.15 | Design system, theming |
| Styling | Emotion (CSS-in-JS) + MUI `sx` | 11.11 | Component styles, theme tokens |
| Client state | Redux Toolkit | 2.2 | Auth session, projects & members, UI state |
| Server state | TanStack Query (React Query) | 5.101 | Phases, categories, tasks, profiles — caching, optimistic updates |
| Routing | react-router-dom | 6.22 | Client-side routing, route guards |
| Backend platform | Supabase | JS client 2.103 | PostgreSQL 17, Auth (GoTrue), PostgREST, Realtime, Edge Functions |
| Edge runtime | Deno (Supabase Edge Functions) | — | `send-invite` function |
| Email delivery | Brevo transactional API | v3 | Invitation emails |
| Dates | Day.js + MUI X Date Pickers | 1.11 / 5.0 | Date handling and pickers |
| Testing | Jest + React Testing Library, `deno test`, SQL integration tests | — | 58 unit/component tests + 9 edge-function tests + RPC integration suite |
| Hosting | Vercel (frontend), Supabase cloud eu-west-1 (backend) | — | Production deployment |
| CI | GitHub Actions | — | Test + build on every push |

---

## 3. System Architecture

```
┌──────────────────────────────┐          ┌─────────────────────────────────────┐
│        BROWSER (SPA)         │          │        SUPABASE (eu-west-1)         │
│                              │          │                                     │
│  React UI (MUI components)   │  HTTPS   │  PostgREST  ←  Row Level Security   │
│        │            │        │◄────────►│      │                              │
│  Redux Toolkit  TanStack     │          │  PostgreSQL 17                      │
│  (auth, projects,  Query     │          │   • 8 tables, CASCADE deletes       │
│   members, UI)  (phases,     │          │   • SECURITY DEFINER helper fns     │
│                  categories, │   WSS    │   • triggers (profiles, manager)    │
│                  tasks,      │◄────────►│  Realtime (postgres_changes)        │
│                  profiles)   │          │                                     │
│                              │  HTTPS   │  GoTrue Auth (JWT, invite-only UX)  │
│  supabase-js client          │◄────────►│                                     │
│                              │          │  Edge Function: send-invite (Deno)  │
└──────────────────────────────┘          │      └─► Brevo API (email)          │
        ▲                                 └─────────────────────────────────────┘
        │ static assets
┌──────────────────────────────┐
│   VERCEL (frontend hosting)  │
│   SPA rewrite → index.html   │
└──────────────────────────────┘
```

There is no custom application server. Supabase's PostgREST exposes the database as a REST API, and **authorization lives in the database itself** as Row Level Security policies — the client is untrusted by design. The one piece of custom server-side code is the `send-invite` edge function, which generates invitation tokens and sends email.

---

## 4. Frontend Architecture

The frontend is layered so that no component talks to Supabase directly:

```
Components (pages, cards, modals)
    │  dispatch / hooks
    ▼
State layer
    ├── Redux Toolkit slices (src/redux, src/slices) — async thunks
    └── TanStack Query hooks (src/queries) — queries + optimistic mutations
    │  call
    ▼
API layer (src/api/*.js) — one module per resource, thin supabase-js wrappers
    │
    ▼
supabaseClient.js — single configured client (env-driven)
```

- **API layer** (`src/api`): `authApi`, `projectsApi`, `phasesApi`, `categoriesApi`, `tasksApi`, `membersApi`, `commentsApi`, `profilesApi`, `invitationsApi`. Each function performs one operation and throws on error; no UI logic.
- **Query hooks** (`src/queries`): wrap the API layer in TanStack Query with per-resource cache keys, snake_case→camelCase mapping, and a shared optimistic-mutation pattern (apply change to cache → rollback on error → invalidate on settle).
- **Route-level code splitting**: heavy pages are `React.lazy`-loaded with a `Suspense` spinner fallback.

---

## 5. State Management

State is deliberately split by its nature:

| State | Where | Why |
|-------|-------|-----|
| Auth session & user | Redux (`authSlice`) | Needed synchronously by route guards on every navigation |
| Projects + members | Redux (`projectmapSlice`, async thunks) | Loaded once per session, used across many views and role checks |
| Phases, categories, tasks, profiles | TanStack Query | High-churn server state benefiting from caching, optimistic updates, background refetching |
| UI state (drawer, alerts) | Redux | Trivial app-wide flags |

**Optimistic updates:** every task/phase/category/profile mutation updates the cache immediately, records the previous value, rolls back on failure, and re-fetches on settlement. Toggling a task feels instant even on a slow connection, and a rejected write (e.g., blocked by RLS) visibly reverts.

**Why not one tool for everything:** Redux gives the guards synchronous access to auth/membership without loading spinners in the routing layer; React Query eliminates hand-written caching/refetch logic for the entity data where it matters most. The split is documented in code comments and was a deliberate architectural exercise.

---

## 6. Routing & Access Control

| Route | Access | Content |
|-------|--------|---------|
| `/` | public | Redirect to `/login` |
| `/login` | public | Email/password sign-in |
| `/accept-invite?token=…` | public | Invitation acceptance (sign-up or sign-in, bound to the invited email) |
| `/privacy`, `/terms` | public | Privacy Policy, Terms of Service |
| `/projectmap/start` | authenticated | Landing page |
| `/projectmap/overview` | authenticated | All my projects with embedded timelines |
| `/projectmap/overview/:projectId` | authenticated | Fullscreen project timeline |
| `/projectmap/managerview` | manager of ≥ 1 project | Aggregated dashboard (managed projects only) |
| `*` | public | Redirect to `/login` |

Two guard components implement client-side access control (UX only — real enforcement is RLS):

- **`ProtectedRoute`** waits for the initial session restore (`sessionChecked`) before deciding, so a hard refresh deep-links back to the same page instead of bouncing through `/login`. After login, the user is returned to the page they originally requested.
- **`ManagerRoute`** admits only users who manage at least one project, showing a spinner until membership data has loaded (fails closed).

---

## 7. Backend: Database Schema

Eight tables (`supabase/01_create_tables.sql`), all with UUID primary keys and `ON DELETE CASCADE` along the containment hierarchy:

```
auth.users ──1:1── profiles (first_name, last_name, avatar_url)
                      │
   projects (name, start_date, end_date, created_by)
      ├── project_members (user_id → profiles, role: manager|member, UNIQUE(project,user))
      ├── phases (name, due_date, sort_order)
      │     └── categories (name, sort_order)
      │           └── tasks (text, completed 0–100, assigned_to, completed_by,
      │                      completed_at, created_by, sort_order)
      │                 └── task_comments (user_id, content, timestamps)
      └── invitations (email, role, status: pending|accepted|expired|revoked,
                       token_hash, invited_by, expires_at, accepted_at,
                       UNIQUE(project, email))
```

**Triggers** (`02`, `06`):
- `on_auth_user_created` → auto-creates a `profiles` row from signup metadata.
- `on_project_created` → auto-adds the creator to `project_members` as `manager`.
- `set_project_creator_trigger` → defaults `created_by` to the authenticated user.

Deleting a project cascades through phases → categories → tasks → comments, plus members and invitations — referential integrity is owned by the database, not the client.

---

## 8. Backend: Security Model (RLS)

Row Level Security is enabled on all eight tables; the browser only ever holds the public *anon* key, so **every read and write is authorized per-row in PostgreSQL**.

The policy model (final form in `04_fix_all_rls_recursion.sql` + later fixes):

- Naïve policies that queried `project_members` from within `project_members` policies caused **infinite recursion**. The fix is a small set of `SECURITY DEFINER` helper functions that bypass RLS internally and are used by all policies: `is_project_manager(project_id)`, `get_my_project_ids()`, `get_my_phase_ids()`, `get_my_category_ids()`, `get_my_task_ids()`, `get_my_email()`.
- **Read access**: members of a project can read the project and everything under it. Profiles are readable by any authenticated user (needed to render names/avatars).
- **Write access**: managers can modify projects, phases, categories, tasks, and memberships; members can update tasks (completion) and create comments; comment authors may edit/delete only their own comments.
- A subtle PostgREST interaction (`14_fix_projects_select_policy.sql`): `INSERT … RETURNING` evaluates the SELECT policy *before* the after-insert membership trigger runs, so the SELECT policy also admits `created_by = auth.uid()`.

The migration files `03`–`14` are kept in sequence deliberately: they document the debugging and hardening history of the security model.

---

## 9. Authentication & the Invitation System

### Authentication
Email/password via Supabase Auth (GoTrue). The session (JWT + refresh token) is restored on page load; `onAuthStateChange` keeps Redux in sync, and a session guard redirects to `/login` on sign-out or expiry. There is **no public registration page** — accounts are created through invitations (or by the administrator in the Supabase dashboard).

### Invitation flow (the security-critical path)

1. A **manager** opens *Manage Team*, enters an email and role. A consent notice above the button states that the recipient must expect the invitation; sending is one explicit action per recipient.
2. The frontend calls the **`send-invite` edge function** with the manager's JWT. The function acts *as the caller* (no service-role key), so authorization — "is this user a manager of this project?" — is enforced by the `create_project_invitation` RPC in SQL.
3. The function generates a **256-bit random token**; only its **SHA-256 hash** is stored (`token_hash`). The raw token exists solely in the emailed link `…/accept-invite?token=<raw>`. Invitations expire after 7 days and can be revoked or re-sent (re-sending rotates the token).
4. Email is sent through **Brevo**; if no email provider is configured, the function returns the link so the manager can share it manually — the modal shows it with a copy button, so the flow degrades gracefully.
5. The invitee opens `/accept-invite?token=…`. The pre-login RPC `get_invitation_by_token` renders the project name, invited email, and status (pending / expired / revoked / accepted). The invitee **creates an account (or signs in)** — the email field is locked to the invited address.
6. `accept_invitation(token)` verifies, server-side, that the caller's authenticated email matches the invitation, then adds the membership idempotently and marks the invitation accepted. If someone is signed in under a *different* account, the page offers "Sign out and continue" rather than failing silently.

An earlier design that auto-accepted invitations by email match on signup was **removed** (`13_drop_legacy_autoaccept.sql`) because knowing an invited address would have been sufficient to join — the token is now the proof of invitation. The RPC suite has a SQL integration test (`supabase/tests/12_invitations_test.sql`) that runs in a rolled-back transaction.

---

## 10. Realtime Collaboration

Supabase Realtime broadcasts `postgres_changes` for five tables (enabled in `09_enable_realtime.sql`). The client hook `useRealtimeSync`:

- routes **tasks / phases / categories** events to targeted TanStack Query cache invalidations (quiet background refetch, no spinner);
- routes **projects / project_members** events to a debounced Redux `loadAllData`;
- debounces both paths (500 ms) to coalesce bursts of changes.

Combined with optimistic updates, the actor sees changes instantly and other project members see them within about a second. RLS applies to the realtime stream as well — users only receive events for rows they can read.

---

## 11. Roles & Permissions

| Action | Manager | Member |
|--------|:-------:|:------:|
| Create project (becomes its manager) | ✅ | ✅* |
| Edit project name/dates, delete project | ✅ | — |
| Invite / remove members, revoke invitations | ✅ | — |
| Create / rename / delete milestones & outcomes | ✅ | — |
| Add / edit / move / assign / delete tasks | ✅ | — |
| Complete or un-complete tasks | ✅ | ✅ |
| Comment on tasks (edit/delete own comments) | ✅ | ✅ |
| Manager View dashboard | ✅ (own managed projects only) | — |

\* Any authenticated user may create a *new* project, becoming its manager; roles are per-project, so the same person can be a manager of one project and a member of another.

Enforcement is two-layered: the UI hides or disables controls based on `useProjectRole` / `useManagesAnyProject` (fail-closed hooks reading `project_members`), and RLS enforces the same matrix server-side regardless of what the client sends.

---

## 12. Error Handling & UX States

- **Error boundary** around routed content prevents white-screen crashes and offers retry.
- **Global error toast** surfaces failed thunks (data loading, auth) as snackbars.
- **Optimistic rollback** restores previous state visibly when a mutation is rejected.
- **Loading states**: full-page spinner only on first data load; realtime refetches are silent. Route lazy-loading and session restore have their own spinners.
- **Empty states** invite action ("Create a new project to start mapping", "No comments yet…", "No projects match your filters").
- **Invitation edge cases** each render a specific screen: invalid, expired, revoked, already accepted, wrong signed-in account (with a sign-out path).
- Error messages are user-readable; the edge function forwards the email provider's reason so failures are diagnosable from the UI.

---

## 13. Responsive Design & Accessibility

Verified with automated browser screenshots at 390×844 (mobile) and 1440×900 (desktop):

- **Navigation drawer**: modal overlay with backdrop on phones, persistent panel on desktop; auto-closes on selection; active route highlighted.
- **Toolbars and dashboards** collapse gracefully: date pickers move out of cramped headers on phones (dates stay editable in the project views), tables scroll horizontally within their cards, typography scales down.
- **Touch support**: controls that reveal on hover (task menus, inline edit pencils) are always visible on touch devices via `@media (hover: none)`.
- **Keyboard accessibility**: visible focus outlines on all interactive elements (ripple is disabled app-wide, so an explicit `:focus-visible` style is themed in); icon-only buttons carry `aria-label`s; modals use MUI's focus trap.
- **Reduced motion** is respected via `prefers-reduced-motion`.
- The **Inter** typeface is loaded with system-font fallbacks; the app ships proper metadata (title, description, theme color, SVG favicon, PWA manifest).

---

## 14. Testing

| Suite | Scope | Count |
|-------|-------|------:|
| Jest + React Testing Library (`src/__tests__`) | Redux slices, route guards (`ProtectedRoute`, `ManagerRoute`), role hooks, React Query hooks incl. optimistic rollback, `AcceptInvite` states, `AddUserModal` invite/revoke, drawer gating | 58 tests / 12 suites |
| `deno test` (`supabase/functions/send-invite/lib.test.ts`) | Token generation, URL building, request validation, email construction | 9 tests |
| SQL integration (`supabase/tests/12_invitations_test.sql`) | Full invitation RPC lifecycle against a real Postgres, wrapped in a rolled-back transaction | 1 suite |

External boundaries (Supabase client, API modules) are mocked in unit tests; the hooks' optimistic update → rollback behavior is tested with controlled promise rejection. CI (`.github/workflows/ci.yml`) runs the Jest suite and a production build on every push.

---

## 15. Deployment & Operations

| Component | Where | Notes |
|-----------|-------|-------|
| Frontend | **Vercel** — https://projectmap-psi.vercel.app | Static CRA build; `vercel.json` rewrites all paths to `index.html` for client routing; `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` set as project env vars |
| Database / Auth / Realtime | **Supabase cloud**, project `milmmxirvkokfpnlikau` (eu-west-1) | Schema applied via the SQL files in `supabase/`; auth Site URL and redirect allow-list point at the production domain |
| Edge function | `supabase functions deploy send-invite` | Secrets: `SITE_URL` (production URL used in invite links), `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` |

Operational notes:
- The Supabase **free tier pauses after ~1 week of inactivity** (symptom: DNS failure / "Failed to fetch" on login). Restore from the Supabase dashboard; no configuration changes are needed.
- Only the anon key ships to the browser; the service-role key is never used by the application. Secrets live in Vercel/Supabase configuration, never in the repository (`.env` is git-ignored; `.env.example` documents the shape).

---

## 16. Project Structure

```
src/
  api/                 Supabase API layer (one module per resource)
  components/          Shared components (modals, guards, error boundary, …)
    NavBar/            App bar + navigation drawer
    managerView/       Dashboard components (accordions, task table, progress)
    projectCards/      Timeline cards (milestone, outcome, task, inline editors)
    startpageView/     Landing page
  constants/           Sidebar items, layout constants, theme names
  layouts/             ProjectMapLayout (app shell: navbar, data load, realtime)
  pages/
    auth/              Login, AcceptInvite
    legal/             Privacy Policy, Terms of Service
    overview/          Project timeline page
    projectList/       Projects list page
  queries/             TanStack Query hooks (+ shared query client)
  redux/               Store + authSlice
  slices/              projectmapSlice (projects, members, UI state)
  themes/              MUI theme (palette, typography, component overrides)
  util/                Role hooks, realtime sync, session guard, date/format helpers
  __tests__/           Jest test suites
supabase/
  01…14_*.sql          Schema, RLS, triggers, RPCs (sequential migration history)
  functions/send-invite/  Edge function (index.ts, lib.ts, lib.test.ts)
  tests/               SQL integration tests
.github/workflows/     CI pipeline
```

---

## 17. Running the Project

```bash
# Prerequisites: Node.js ≥ 18, npm. Backend is the hosted Supabase project.
cp .env.example .env         # fill in REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY
npm install
npm start                    # http://localhost:3000
npm test -- --watchAll=false # unit tests
npm run build                # production build
deno test supabase/functions/send-invite/lib.test.ts   # edge-function tests
```

Because registration is invitation-based, the **first** account in a fresh database is created in the Supabase dashboard (*Authentication → Add user*, with auto-confirm); every subsequent user joins through an in-app invitation.

---

## 18. Design Decisions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **Supabase instead of a custom backend** | A hand-written Node/Express API would re-implement what PostgREST + RLS provide, with more surface for authorization bugs. Moving authorization into the database makes the client untrusted by construction. |
| **Split state: Redux + TanStack Query** | Guards need synchronous auth/membership state; entity data benefits from query caching and optimistic updates. Using each tool for what it is best at, with the boundary documented. |
| **Tokenized invitations over email-match auto-join** | The initial trigger-based design let anyone who knew an invited address join by signing up. Hashed one-time tokens make possession of the emailed link the proof of invitation. |
| **Edge function without service-role key** | `send-invite` forwards the caller's JWT so the SQL RPC performs the manager check; compromising the function leaks no privileged credential. |
| **Database-owned integrity** | CASCADE deletes and UNIQUE constraints eliminate the orphaned-data class of bugs the localStorage prototype suffered from. |
| **Commit-on-blur editing** | Inline editors (project/phase/category titles) buffer locally and persist once, avoiding one API call per keystroke and dropped characters on slow networks. |
| **Graceful email degradation** | Invitations are functional without an email provider: the accept link is returned and shown for manual sharing, so a third-party outage never blocks team building. |

---

## 19. Known Limitations & Future Work

- **Free-tier pausing** — the hosted database sleeps after inactivity and must be resumed from the dashboard (acceptable for an academic deployment; a paid tier removes it).
- **Create React App is in maintenance mode** — a Vite migration is the natural next toolchain step.
- **`@mui/x-date-pickers` is a pinned early version** — upgrading implies API changes across pickers.
- **Timeline slider renders one tick per project day** — fine at typical durations; multi-year projects would warrant sampling.
- **No pagination** — project/task volumes for team use are far below the thresholds where server-side pagination becomes necessary; the API layer would accept it naturally.
- Feature ideas: drag-and-drop reordering (`sort_order` columns already exist), project archiving, notification digests for approaching deadlines, file attachments via Supabase Storage, a theme switcher (the theme system already supports variants).
