# FINALPLAN.md — ProjectMap Complete Development Plan

> **Goal:** Take ProjectMap from a client-side prototype to a production-ready full-stack application with Supabase backend, invite-only authentication, role-based access control, and real functionality for every UI element.

---

## Code Standards & Best Practices

All code written in this project must follow these rules:

### React & Components
- Functional components only — no class components
- Use named exports for components (+ default export)
- Props destructuring in function signature
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations (progress calculations, filtered lists)
- `React.memo` on components that receive stable props but re-render often
- Keep components small — if a component exceeds ~150 lines, split it
- Co-locate related files (component + styles + tests in same folder when applicable)

### State Management
- Redux Toolkit only — no raw Redux
- `createAsyncThunk` for all API calls (Phase 3+)
- Never put side effects in reducers
- Selectors in slice files using `createSelector` for memoized derived data
- Separate UI state from entity/data state
- Loading/error states for every async operation: `{ status: 'idle' | 'loading' | 'succeeded' | 'failed', error: null | string }`

### Code Quality
- No `any` types if we ever add TypeScript
- No hardcoded strings — use constants
- No magic numbers — use named constants
- No `console.log` in production code (remove before commit)
- No commented-out code — delete it, git has history
- DRY but not over-abstracted — 3 repetitions before extracting
- Early returns over nested if/else
- Descriptive variable names: `projectPhases` not `data` or `arr`

### File & Naming Conventions
- Components: `PascalCase.jsx` (e.g., `EditTaskModal.jsx`)
- Utilities/helpers: `camelCase.js` (e.g., `supabaseClient.js`)
- Constants: `camelCase.js` with `UPPER_SNAKE_CASE` exports
- API services: `camelCase.js` (e.g., `projectsApi.js`)
- One component per file
- Index files only for barrel exports, not logic

### Styling
- MUI `sx` prop for one-off styles
- Emotion `styled()` for reusable styled components
- Theme tokens always — never hardcode colors (use `theme.palette.x.y`)
- Responsive: use MUI breakpoints, never raw `@media`

### Error Handling
- Try/catch around all async operations
- User-facing error messages (not raw error objects)
- Error boundaries around route-level components
- Never swallow errors silently

### Accessibility
- All interactive elements must be keyboard accessible
- Buttons have `aria-label` when icon-only
- Form inputs have associated labels
- Modals trap focus and have proper `aria-` attributes

### Git & Commits
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- One logical change per commit
- Never commit `.env`, `node_modules`, or secrets

---

## Progress Tracker

### Phase 1: Fix Frontend
- [x] 1.1 — Fix routing + auth pages (UI only)
- [x] 1.2 — Fix cascade deletes
- [x] 1.3 — Fix task Edit/Move actions
- [x] 1.4 — Track who completed tasks
- [x] 1.5 — Fix task assignment
- [x] 1.6 — Implement timer/deadline indicator
- [x] 1.7 — Replace comment icon with actions dropdown
- [x] 1.8 — Implement Manager View filter
- [x] 1.9 — Prepare role-based UI
- [x] 1.10 — Extract side effects from reducers
- [x] 1.11 — Add error boundaries

### Phase 2: Supabase Setup
- [x] 2.1 — Create Supabase project
- [x] 2.2 — Create database tables
- [x] 2.3 — Create RLS policies
- [x] 2.4 — Create functions & triggers
- [x] 2.5 — Configure auth (invite-only)

### Phase 3: Connect Frontend to Supabase
- [x] 3.1 — Install Supabase client
- [x] 3.2 — Create client config
- [x] 3.3 — Implement real auth + invite flow
- [x] 3.4 — Create API layer (7 service files)
- [x] 3.5 — Replace localStorage with async thunks
- [x] 3.6 — Replace AddUserModal with invite flow (temporary — uses existing picker, calls Supabase API)
- [x] 3.7 — Update Manager View with real data (done in 3.5 — data comes from Supabase now)
- [x] 3.8 — Implement task comments (moved to 4.0c)
- [x] 3.9 — Add loading/error states (ProjectMapLayout shows spinner/error)
- [x] 3.10 — Wire up real role-based access (useProjectRole reads from project_members)
- [x] 3.11 — Fixed legacy anon key (new publishable key format not compatible with JS client)
- [x] 3.12 — Fixed RLS infinite recursion (SECURITY DEFINER helper functions)
- [x] 3.13 — Fixed missing profile for manually created user
- [x] 3.14 — Fixed task completion with real user ID

### Phase 4: Polish & Production
- [x] 4.0a — Add Person rewritten to email-based invite flow
- [x] 4.0b — Task Assignment picker in Manager View (click avatar → pick member)
- [x] 4.0c — Task Comments (members + managers can comment)
- [x] 4.0d — Profile Setup (edit name/avatar + auto-prompt on first login)
- [x] 4.1 — Realtime subscriptions (useRealtimeSync hook — live updates across users)
- [x] 4.2 — Error handling & edge cases (session guard + global error toast)
- [x] 4.3 — Performance optimization (lazy loading routes + debounced realtime sync)
- [x] 4.4 — Clean up dead code & constants
- [x] 4.5 — Testing (19 tests: authSlice, projectmapSlice, ProtectedRoute)

---

## Decisions (Confirmed)

| # | Decision | Answer |
|---|----------|--------|
| 1 | Timer button | Implement — show days remaining. Orange at 5 days, red at 3 days, full red + "Overdue" if past deadline |
| 2 | Actions column | Replace comment icon with actions dropdown menu (role-aware) |
| 3 | Comments | Members can comment on tasks. Need `comments` table + comment UI |
| 4 | Member permissions | Members can only: complete tasks + comment on tasks. Nothing else |
| 5 | Registration | Invite-only. Manager enters email → Supabase sends invite → user sets up account |
| 6 | Creator role | Project creator automatically becomes manager |
| 7 | Landing page | Keep after login |

---

## Current Problems Summary

| # | Problem | Where |
|---|---------|-------|
| 1 | No `/` route — app shows blank on root URL | `routes.js` |
| 2 | No login / authentication | Missing entirely |
| 3 | No role-based access control — everyone can do everything | All components |
| 4 | "Assigned" column in Manager View is hardcoded to "RK" | `AccordionDetailsTable.jsx:82` |
| 5 | Task "Edit" menu item does nothing | `Task.jsx:112-115` |
| 6 | Task "Move" menu item does nothing | `Task.jsx:116-119` |
| 7 | Comment button in Manager View does nothing | `AccordionDetailsTable.jsx:97-101` |
| 8 | Timer button in Manager View is placeholder ("NEW BUTTON") | `ProjectAccordionManagerView.jsx:168-175` |
| 9 | Filter icon in Manager View does nothing | `ManagerView.jsx` |
| 10 | No cascade delete — deleting project leaves orphaned data | `projectmapSlice.js:39-42` |
| 11 | Users are picked from a hardcoded list, not real users | `users.js:36-41` |
| 12 | Who completed a task is not tracked | `projectmapSlice.js:93-101` |
| 13 | No way to delete phases or categories | Missing reducers |
| 14 | No way to remove a user from a project | Missing reducer |
| 15 | All data in localStorage — no persistence, no multi-user | `localState.js` |
| 16 | `authSlice.js` exists but is not connected to store | `store.js` |
| 17 | Side effects (localStorage) inside Redux reducers | `projectmapSlice.js` |
| 18 | No error boundaries, no loading states, no error states | All components |

---

## Roles & Permissions Model

| Action | Manager | Member |
|--------|:-------:|:------:|
| Create project | Yes | No |
| Edit project name | Yes | No |
| Change project dates | Yes | No |
| Delete project | Yes | No |
| Invite people to project | Yes | No |
| Remove people from project | Yes | No |
| Create/edit/delete phases | Yes | No |
| Create/edit/delete categories | Yes | No |
| Add tasks | Yes | No |
| Edit tasks | Yes | No |
| Move tasks | Yes | No |
| Delete tasks | Yes | No |
| Assign tasks | Yes | No |
| Complete/uncomplete tasks | Yes | Yes |
| Comment on tasks | Yes | Yes |
| View Manager View dashboard | Yes | No |
| View project timeline | Yes | Yes |

---

## Phase 1: Fix Frontend (No Backend Yet)

**Goal:** Fix all broken functionality and prepare clean architecture for backend integration. Everything still uses localStorage temporarily.

### 1.1 — Fix Routing

- Add `/` route → redirect to `/login`
- Add `/login` page (UI only — hardcode a demo login for now)
- Add `/accept-invite` page (UI only — where invited users will land to set up account)
- Add `/projectmap` → redirect to `/projectmap/start` if not authenticated
- Add 404 catch-all route
- Add `ProtectedRoute` component that checks auth state

**Files to create:**
- `src/pages/auth/Login.jsx`
- `src/pages/auth/AcceptInvite.jsx` (account setup page for invited users)
- `src/components/ProtectedRoute.jsx`

**Files to modify:**
- `src/routes.js`
- `src/App.js`

**Note:** No public `/register` page. Users can only join via manager invitation.

### 1.2 — Fix Cascade Deletes

When a project is deleted, also delete all its:
- Phases (where `projectId === id`)
- Categories (where `phaseId` belongs to deleted phases)
- Tasks (where `categoryId` belongs to deleted categories)
- Users/members (where `projectId === id`)

Add missing delete reducers:
- `deletePhase` — also deletes categories + tasks under it
- `deleteCategory` — also deletes tasks under it
- `removeUserFromProject`

**Files to modify:**
- `src/slices/projectmapSlice.js`

### 1.3 — Fix Task Actions (Edit, Move)

**Edit Task** (manager only):
- Create `EditTaskModal.jsx` with text input
- Add `updateTask` reducer to slice
- Wire "Edit" menu item in `Task.jsx` to open modal

**Move Task** (manager only):
- Create `MoveTaskModal.jsx` with phase/category dropdowns
- Add `moveTask` reducer (update `categoryId` and `phaseId`)
- Wire "Move" menu item in `Task.jsx` to open modal

Both Edit and Move menu items should be hidden for members (they only see the task checkbox).

**Files to create:**
- `src/components/EditTaskModal.jsx`
- `src/components/MoveTaskModal.jsx`

**Files to modify:**
- `src/components/projectCards/Task.jsx`
- `src/slices/projectmapSlice.js`

### 1.4 — Track Who Completed a Task

- Add `completedBy` field to task model (`null` or `userId`)
- Add `completedAt` field to task model (`null` or timestamp)
- Update `toggleTaskCompleted` reducer to set these fields using `currentUser`
- This data will show in Manager View table later

**Files to modify:**
- `src/slices/projectmapSlice.js`

### 1.5 — Fix Task Assignment

- Add `assignedTo` field to task model
- Add `assignTask` reducer (manager only)
- Create assignment UI — user picker dropdown in Manager View table "Assigned" column
- Show actual assigned user avatar + initials in `AccordionDetailsTable.jsx` (replace hardcoded "RK")
- Unassigned tasks show empty avatar placeholder

**Files to modify:**
- `src/slices/projectmapSlice.js`
- `src/components/managerView/AccordionDetailsTable.jsx`

### 1.6 — Implement Timer Button (Deadline Indicator)

Replace the placeholder timer button in `ProjectAccordionManagerView.jsx` with a real deadline indicator:

**Logic:**
```
days = endDate - today

if days > 5:     → Green icon, tooltip: "X days remaining"
if days <= 5:    → Orange icon + orange text, tooltip: "X days remaining"  
if days <= 3:    → Red icon + red text, tooltip: "X days remaining — urgent!"
if days <= 0:    → Full red icon + red badge, tooltip: "Overdue by X days"
                   Show "OVERDUE" label or badge on the project
```

**Visual:** The timer icon color changes dynamically. Optionally show the day count as a small badge/label next to the icon.

**Files to modify:**
- `src/components/managerView/ProjectAccordionManagerView.jsx` (replace placeholder)

### 1.7 — Replace Comment Icon with Actions Dropdown

Replace the comment icon in `AccordionDetailsTable.jsx` with an actions dropdown menu per table row:

**Manager sees:**
- Edit task (opens EditTaskModal)
- Move task (opens MoveTaskModal)
- Assign task (opens user picker)
- Delete task

**Member sees:**
- Mark as done / Mark as not done
- Comment (opens comment input — placeholder UI for now)

**Files to modify:**
- `src/components/managerView/AccordionDetailsTable.jsx`

### 1.8 — Implement Manager View Filter

Implement the filter icon functionality in `ManagerView.jsx`:
- Search by project name (text field)
- Filter by task status: All / Completed / In Progress
- Filter by assigned user (dropdown)

**Files to modify:**
- `src/components/managerView/ManagerView.jsx`
- `src/components/managerView/ProjectListManagerView.jsx`

### 1.9 — Prepare Role-Based UI

- Add `currentUser` to Redux state (simulated for now, real after auth)
- Check user's role on the current project
- Conditionally render/disable UI elements based on role:
  - Hide "Add Person" button for members
  - Make project name, dates read-only for members
  - Hide delete project button for members
  - Hide "Add Phase" / "Add Category" buttons for members
  - Hide Edit/Move/Delete on tasks for members
  - Keep task completion checkbox enabled for all roles
  - Manager View route only accessible to managers

**Files to modify:**
- `src/slices/projectmapSlice.js` (add currentUser)
- `src/components/NavBar/NavBar.jsx`
- `src/components/ProjectAccordion.jsx`
- `src/pages/overview/Overview.jsx`
- `src/components/ProjectPhase.jsx`
- `src/components/projectCards/Task.jsx`
- `src/components/projectCards/SecondaryCard.jsx`
- `src/components/managerView/ManagerView.jsx`
- `src/components/ProtectedRoute.jsx` (role-based guard)

### 1.10 — Extract Side Effects from Reducers

- Move all `setProjects()`, `setPhases()`, etc. calls OUT of reducers
- Create Redux middleware or use RTK listener middleware for localStorage sync
- This makes the transition to Supabase API calls clean

**Files to modify:**
- `src/slices/projectmapSlice.js`
- `src/redux/store.js`

### 1.11 — Add Error Boundaries & Loading States

- Create `ErrorBoundary.jsx` wrapper component
- Wrap route components with error boundary
- Add loading spinner component for future async operations
- Add empty state components (no projects yet, no tasks yet)

**Files to create:**
- `src/components/ErrorBoundary.jsx`
- `src/components/LoadingSpinner.jsx`

**Files to modify:**
- `src/App.js` or `src/layouts/ProjectMapLayout.jsx`

---

## Phase 2: Supabase Setup

**Goal:** Create the backend — database, auth, security policies. No frontend changes yet.

### 2.1 — Create Supabase Project

- Create new Supabase project
- Note down: Project URL, Anon Key, Service Role Key
- Store keys in `.env` file (add `.env` to `.gitignore`)

**Files to create:**
- `.env` (REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY)
- `.env.example` (template without real values)

### 2.2 — Create Database Tables

```sql
-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project Members (who belongs to which project, with role)
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Phases / Milestones
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories / Outcomes
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0 CHECK (completed BETWEEN 0 AND 100),
  assigned_to UUID REFERENCES profiles(id),
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments on tasks
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invitations (track pending invites)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'member')) DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(project_id, email)
);
```

### 2.3 — Create Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Projects: only members can see
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT TO authenticated USING (
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Any authenticated user can create projects"
  ON projects FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Managers can update projects"
  ON projects FOR UPDATE TO authenticated USING (
    id IN (SELECT project_id FROM project_members
           WHERE user_id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Managers can delete projects"
  ON projects FOR DELETE TO authenticated USING (
    id IN (SELECT project_id FROM project_members
           WHERE user_id = auth.uid() AND role = 'manager')
  );

-- Project Members: members can view, managers can modify
CREATE POLICY "Members can view team"
  ON project_members FOR SELECT TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can add members"
  ON project_members FOR INSERT TO authenticated WITH CHECK (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
    OR user_id = auth.uid()  -- allow self-insert when accepting invite
  );

CREATE POLICY "Managers can remove members"
  ON project_members FOR DELETE TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

-- Phases: members can view, managers can modify
CREATE POLICY "Members can view phases"
  ON phases FOR SELECT TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can modify phases"
  ON phases FOR ALL TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

-- Categories: members can view, managers can modify
CREATE POLICY "Members can view categories"
  ON categories FOR SELECT TO authenticated USING (
    phase_id IN (
      SELECT id FROM phases WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can modify categories"
  ON categories FOR ALL TO authenticated USING (
    phase_id IN (
      SELECT id FROM phases WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND role = 'manager'
      )
    )
  );

-- Tasks: members can view and update (complete), managers can do everything
CREATE POLICY "Members can view tasks"
  ON tasks FOR SELECT TO authenticated USING (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN phases p ON c.phase_id = p.id
      WHERE p.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can insert tasks"
  ON tasks FOR INSERT TO authenticated WITH CHECK (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN phases p ON c.phase_id = p.id
      WHERE p.project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND role = 'manager'
      )
    )
  );

CREATE POLICY "Members can update tasks (complete only)"
  ON tasks FOR UPDATE TO authenticated USING (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN phases p ON c.phase_id = p.id
      WHERE p.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can delete tasks"
  ON tasks FOR DELETE TO authenticated USING (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN phases p ON c.phase_id = p.id
      WHERE p.project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND role = 'manager'
      )
    )
  );

-- Task Comments: project members can view and create, only author can edit/delete
CREATE POLICY "Members can view comments"
  ON task_comments FOR SELECT TO authenticated USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN categories c ON t.category_id = c.id
      JOIN phases p ON c.phase_id = p.id
      WHERE p.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can create comments"
  ON task_comments FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN categories c ON t.category_id = c.id
      JOIN phases p ON c.phase_id = p.id
      WHERE p.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authors can update own comments"
  ON task_comments FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authors can delete own comments"
  ON task_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Invitations: managers can manage, invited users can view their own
CREATE POLICY "Managers can manage invitations"
  ON invitations FOR ALL TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Users can view their own invitations"
  ON invitations FOR SELECT TO authenticated USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

### 2.4 — Create Database Functions & Triggers

```sql
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-add project creator as manager
CREATE OR REPLACE FUNCTION handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'manager');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_new_project();

-- Auto-accept invitation when invited user signs up
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN
    SELECT * FROM invitations
    WHERE email = NEW.email AND status = 'pending'
  LOOP
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (inv.project_id, NEW.id, inv.role)
    ON CONFLICT (project_id, user_id) DO NOTHING;

    UPDATE invitations SET status = 'accepted' WHERE id = inv.id;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_accepts_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_acceptance();

-- Manager View aggregation function
CREATE OR REPLACE FUNCTION get_project_summary(p_project_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_tasks', COUNT(t.id),
    'completed_tasks', COUNT(t.id) FILTER (WHERE t.completed = 100),
    'total_phases', COUNT(DISTINCT ph.id),
    'member_count', (SELECT COUNT(*) FROM project_members WHERE project_id = p_project_id)
  )
  FROM phases ph
  LEFT JOIN categories c ON c.phase_id = ph.id
  LEFT JOIN tasks t ON t.category_id = c.id
  WHERE ph.project_id = p_project_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Invite user function (sends email via Supabase)
CREATE OR REPLACE FUNCTION invite_user_to_project(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS JSON AS $$
DECLARE
  existing_user UUID;
  result JSON;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user FROM auth.users WHERE email = p_email;

  IF existing_user IS NOT NULL THEN
    -- User exists: add directly to project
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (p_project_id, existing_user, p_role)
    ON CONFLICT (project_id, user_id) DO NOTHING;

    RETURN json_build_object('status', 'added_directly', 'user_id', existing_user);
  ELSE
    -- User doesn't exist: create invitation record
    INSERT INTO invitations (project_id, email, role, invited_by)
    VALUES (p_project_id, p_email, p_role, auth.uid())
    ON CONFLICT (project_id, email) DO UPDATE SET
      role = EXCLUDED.role,
      status = 'pending',
      created_at = now(),
      expires_at = now() + INTERVAL '7 days';

    RETURN json_build_object('status', 'invitation_sent', 'email', p_email);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.5 — Set Up Auth Configuration

- Enable Email/Password auth in Supabase dashboard
- Enable "Invite only" mode (disable public signups)
- Configure redirect URLs:
  - Site URL: `http://localhost:3000`
  - Redirect URL: `http://localhost:3000/accept-invite`
- Customize invite email template to include project name

---

## Phase 3: Connect Frontend to Supabase

**Goal:** Replace localStorage with Supabase. Wire up real authentication.

### 3.1 — Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3.2 — Create Supabase Client

**File to create:** `src/api/supabaseClient.js`

### 3.3 — Implement Real Authentication

**Login flow:**
1. User enters email + password on `/login`
2. Call `supabase.auth.signInWithPassword()`
3. On success → redirect to `/projectmap/start`
4. On failure → show error message

**Invite flow:**
1. Manager opens "Add Person" modal → enters email + selects role (manager/member)
2. Frontend calls `invite_user_to_project()` RPC function
3. If user exists → added to project immediately
4. If user doesn't exist → Supabase sends invite email
5. Invited user clicks email link → lands on `/accept-invite`
6. User enters first name, last name, password
7. Call `supabase.auth.signUp()` with metadata
8. Trigger auto-accepts pending invitations → user joins project(s)
9. Redirect to `/projectmap/start`

**Session management:**
- Listen to `supabase.auth.onAuthStateChange()` in `App.js`
- Store current user + session in Redux (rewrite `authSlice.js`)
- On session expiry → redirect to `/login`

**Files to create:**
- `src/api/supabaseClient.js`

**Files to modify:**
- `src/pages/auth/Login.jsx` (connect to Supabase)
- `src/pages/auth/AcceptInvite.jsx` (connect to Supabase)
- `src/redux/slices/authSlice.js` (full rewrite)
- `src/redux/store.js` (register authSlice)
- `src/components/ProtectedRoute.jsx` (check real session)
- `src/components/NavBar/NavBar.jsx` (real user name + logout button)
- `src/App.js` (auth state listener)

### 3.4 — Create API Layer

**Files to create:**
- `src/api/projectsApi.js` — CRUD for projects
- `src/api/phasesApi.js` — CRUD for phases
- `src/api/categoriesApi.js` — CRUD for categories
- `src/api/tasksApi.js` — CRUD for tasks (assign, complete, move, edit)
- `src/api/membersApi.js` — invite user, remove member, list members
- `src/api/commentsApi.js` — CRUD for task comments
- `src/api/profilesApi.js` — get profiles for display

### 3.5 — Replace localStorage with API Calls

Convert each reducer action to an async thunk using `createAsyncThunk`:

| Current Action | New Async Thunk | API Call |
|---------------|----------------|----------|
| `addProject` | `createProject` | `supabase.from('projects').insert(...)` |
| `updateProject` | `updateProject` | `supabase.from('projects').update(...)` |
| `deleteProject` | `deleteProject` | `supabase.from('projects').delete(...)` (CASCADE) |
| `addPhase` | `createPhase` | `supabase.from('phases').insert(...)` |
| `updatePhase` | `updatePhase` | `supabase.from('phases').update(...)` |
| `deletePhase` | `deletePhase` | `supabase.from('phases').delete(...)` (CASCADE) |
| `addCategory` | `createCategory` | `supabase.from('categories').insert(...)` |
| `deleteCategory` | `deleteCategory` | `supabase.from('categories').delete(...)` (CASCADE) |
| `addTask` | `createTask` | `supabase.from('tasks').insert(...)` |
| `deleteTask` | `deleteTask` | `supabase.from('tasks').delete(...)` |
| `updateTask` | `updateTask` | `supabase.from('tasks').update(...)` |
| `moveTask` | `moveTask` | `supabase.from('tasks').update({ category_id })` |
| `assignTask` | `assignTask` | `supabase.from('tasks').update({ assigned_to })` |
| `toggleTaskCompleted` | `toggleTask` | `supabase.from('tasks').update({ completed, completed_by, completed_at })` |
| `addUser` | `inviteMember` | `supabase.rpc('invite_user_to_project', ...)` |
| — | `fetchProjects` | `supabase.from('projects').select(...)` |
| — | `fetchProjectData` | Load phases + categories + tasks for one project |

**Files to modify:**
- `src/slices/projectmapSlice.js` (major rewrite — async thunks)
- `src/redux/store.js`

**Files to delete:**
- `src/util/localState.js` (no longer needed)

### 3.6 — Replace AddUserModal with Invite Flow

Current `AddUserModal` picks from hardcoded `pickerUsers` list. Replace with:

- Email input field (instead of name picker)
- Role dropdown: Manager / Member
- "Send Invite" button
- Show pending invitations list below current members
- Show current project members with remove button (manager only)

**Files to modify:**
- `src/components/AddUserModal.jsx` (rewrite as invite modal)
- `src/components/ProjectUsers.jsx` (load real members from API)
- `src/constants/users.js` (delete hardcoded lists, keep role constants)

### 3.7 — Update Manager View with Real Data

- **Assigned column:** Show actual `assigned_to` user from task → profile lookup
- **Completed by:** When a task is completed, show who did it (from `completed_by` field)
- **Timer/deadline:** Already implemented in Phase 1.6, now uses real dates from database
- **Actions dropdown:** Already implemented in Phase 1.7, now triggers real API calls

**Files to modify:**
- `src/components/managerView/AccordionDetailsTable.jsx`
- `src/components/managerView/TaskProgress.jsx`
- `src/components/managerView/ProjectAccordionManagerView.jsx`

### 3.8 — Implement Task Comments

- Create `TaskCommentThread.jsx` — shows list of comments on a task
- Create `AddComment.jsx` — input for new comment
- Comments accessible from:
  - Actions dropdown in Manager View table → "Comments" option
  - A comment icon/count on tasks in project timeline view
- Both managers and members can comment
- Only comment author can edit/delete their own comments

**Files to create:**
- `src/components/TaskCommentThread.jsx`
- `src/components/AddComment.jsx`

### 3.9 — Add Loading & Error States

Every component that fetches data needs:
- Loading spinner while data loads
- Error message with retry button if fetch fails
- Empty state if no data (e.g., "No projects yet — create one!")

**Files to modify:** All page components and data-displaying components

### 3.10 — Wire Up Role-Based Access (Real)

- On project load, fetch current user's role from `project_members`
- Store per-project role in Redux or React context
- Replace the simulated role check (Phase 1.9) with real database role
- Supabase RLS provides server-side enforcement as the security backbone
- Frontend role checks are for UX only (hiding/disabling UI elements)

---

## Phase 4: Polish & Production

**Goal:** App is stable, performant, and ready for thesis presentation.

### 4.1 — Realtime Subscriptions

- Subscribe to task changes → live progress updates in Manager View
- Subscribe to project member changes → new members appear immediately
- Subscribe to comments → new comments appear without refresh
- When another user completes a task, the Manager View updates live

```javascript
supabase
  .channel('project-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks',
    filter: `category_id=in.(${categoryIds})` },
    (payload) => { /* update Redux state */ })
  .subscribe();
```

### 4.2 — Error Handling & Edge Cases

- Network failure → show toast notification + retry button
- Optimistic updates for task completion (instant checkbox, rollback on failure)
- Handle concurrent edits gracefully (last write wins with notification)
- Session expiry → redirect to login with "Session expired" message
- Invitation edge cases: expired invite, already a member, invalid email

### 4.3 — Performance

- `React.memo` on heavy components (TaskProgress, AccordionDetailsTable)
- `React.lazy` + `Suspense` for route components
- Paginate project lists if > 20 projects
- `useMemo` for progress calculations

### 4.4 — Clean Up

- Delete `src/util/localState.js`
- Delete `src/constants/projects.js`, `phases.js`, `categories.js`, `tasks.js`
- Clean `src/constants/users.js` — keep only role constants
- Remove `src/reportWebVitals.js` (already deleted in git)
- Audit and remove unused imports/dependencies

### 4.5 — Testing

- Unit tests for Redux async thunks (mock Supabase calls)
- Integration tests for: login → create project → invite member → member completes task → manager sees in dashboard
- Component tests for role-based rendering (manager sees X, member sees Y)

---

## Execution Order Summary

```
Phase 1 (Frontend Fixes)              ← START HERE, NO BACKEND NEEDED
  1.1  Fix routing + auth pages (UI only)
  1.2  Fix cascade deletes
  1.3  Fix task Edit/Move actions
  1.4  Track who completed tasks
  1.5  Fix task assignment
  1.6  Implement timer/deadline indicator
  1.7  Replace comment icon with actions dropdown
  1.8  Implement Manager View filter
  1.9  Prepare role-based UI
  1.10 Extract side effects from reducers
  1.11 Add error boundaries

Phase 2 (Supabase Setup)              ← DATABASE + AUTH, NO FRONTEND
  2.1  Create Supabase project
  2.2  Create tables (7 tables + invitations)
  2.3  Create RLS policies
  2.4  Create functions & triggers
  2.5  Configure auth (invite-only)

Phase 3 (Integration)                 ← CONNECT EVERYTHING
  3.1  Install Supabase client
  3.2  Create client config
  3.3  Implement real authentication + invite flow
  3.4  Create API layer (7 service files)
  3.5  Replace localStorage with async thunks
  3.6  Replace AddUserModal with invite flow
  3.7  Update Manager View with real data
  3.8  Implement task comments
  3.9  Add loading/error states
  3.10 Wire up real role-based access

Phase 4 (Polish)                      ← PRODUCTION READY
  4.1  Realtime subscriptions
  4.2  Error handling & edge cases
  4.3  Performance optimization
  4.4  Clean up dead code & constants
  4.5  Testing
```

---

## Complete File Inventory

### New Files to Create

| File | Phase | Purpose |
|------|-------|---------|
| `src/pages/auth/Login.jsx` | 1.1 | Login page |
| `src/pages/auth/AcceptInvite.jsx` | 1.1 | Account setup for invited users |
| `src/components/ProtectedRoute.jsx` | 1.1 | Auth + role route guard |
| `src/components/EditTaskModal.jsx` | 1.3 | Edit task dialog |
| `src/components/MoveTaskModal.jsx` | 1.3 | Move task dialog |
| `src/components/ErrorBoundary.jsx` | 1.11 | Error boundary wrapper |
| `src/components/LoadingSpinner.jsx` | 1.11 | Loading indicator |
| `.env` | 2.1 | Supabase credentials |
| `.env.example` | 2.1 | Template for env vars |
| `src/api/supabaseClient.js` | 3.2 | Supabase client init |
| `src/api/projectsApi.js` | 3.4 | Projects service |
| `src/api/phasesApi.js` | 3.4 | Phases service |
| `src/api/categoriesApi.js` | 3.4 | Categories service |
| `src/api/tasksApi.js` | 3.4 | Tasks service |
| `src/api/membersApi.js` | 3.4 | Members + invitations service |
| `src/api/commentsApi.js` | 3.4 | Task comments service |
| `src/api/profilesApi.js` | 3.4 | User profiles service |
| `src/components/TaskCommentThread.jsx` | 3.8 | Comment thread display |
| `src/components/AddComment.jsx` | 3.8 | Comment input |

### Files to Delete

| File | Phase | Reason |
|------|-------|--------|
| `src/util/localState.js` | 3.5 | Replaced by Supabase API |
| `src/constants/projects.js` | 4.4 | Seed data not needed |
| `src/constants/phases.js` | 4.4 | Seed data not needed |
| `src/constants/categories.js` | 4.4 | Seed data not needed |
| `src/constants/tasks.js` | 4.4 | Seed data not needed |

### Files with Major Modifications

| File | Phases | What Changes |
|------|--------|-------------|
| `src/routes.js` | 1.1, 3.3 | Auth routes, guards, accept-invite |
| `src/App.js` | 1.1, 3.3 | Auth listener, route structure |
| `src/slices/projectmapSlice.js` | 1.2–1.10, 3.5 | New reducers → async thunks |
| `src/redux/store.js` | 1.10, 3.3 | Middleware, authSlice |
| `src/redux/slices/authSlice.js` | 3.3 | Full rewrite for Supabase |
| `src/components/projectCards/Task.jsx` | 1.3, 1.9 | Edit/Move + role-based visibility |
| `src/components/managerView/AccordionDetailsTable.jsx` | 1.5, 1.7, 3.7 | Real data + actions dropdown |
| `src/components/managerView/ProjectAccordionManagerView.jsx` | 1.6 | Deadline indicator |
| `src/components/managerView/ManagerView.jsx` | 1.8, 1.9 | Filter + role guard |
| `src/components/managerView/ProjectListManagerView.jsx` | 1.8 | Filter props |
| `src/components/NavBar/NavBar.jsx` | 1.9, 3.3 | Role-based UI, real user, logout |
| `src/components/ProjectAccordion.jsx` | 1.9 | Role-based controls |
| `src/pages/overview/Overview.jsx` | 1.9 | Role-based add phase button |
| `src/components/ProjectPhase.jsx` | 1.9 | Role-based add category |
| `src/components/projectCards/SecondaryCard.jsx` | 1.9 | Role-based task controls |
| `src/components/AddUserModal.jsx` | 3.6 | Rewrite as invite modal |
| `src/components/ProjectUsers.jsx` | 3.6 | Load real members |
| `src/constants/users.js` | 3.6 | Remove hardcoded lists |

---

## Database Schema Summary

```
profiles ──────────────────── auth.users (1:1)
    │
    ├── projects (created_by)
    │       │
    │       ├── project_members (project_id + user_id → profiles)
    │       │       └── role: 'manager' | 'member'
    │       │
    │       └── phases (project_id)
    │               │
    │               └── categories (phase_id)
    │                       │
    │                       └── tasks (category_id)
    │                               │
    │                               ├── assigned_to → profiles
    │                               ├── completed_by → profiles
    │                               ├── created_by → profiles
    │                               │
    │                               └── task_comments (task_id)
    │                                       └── user_id → profiles
    │
    └── invitations (project_id, invited_by → profiles)
            └── email, role, status: pending|accepted|expired
```

All parent → child relationships use `ON DELETE CASCADE`.

---

*Ready to start Phase 1.1 — say the word.*
