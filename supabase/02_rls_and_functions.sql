-- =============================================
-- RLS Policies + Functions & Triggers
-- Run this in Supabase SQL Editor (new query)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- =============================================
-- PROJECTS POLICIES
-- =============================================
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

-- =============================================
-- PROJECT MEMBERS POLICIES
-- =============================================
CREATE POLICY "Members can view team"
  ON project_members FOR SELECT TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can add members"
  ON project_members FOR INSERT TO authenticated WITH CHECK (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
    OR user_id = auth.uid()
  );

CREATE POLICY "Managers can remove members"
  ON project_members FOR DELETE TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

-- =============================================
-- PHASES POLICIES
-- =============================================
CREATE POLICY "Members can view phases"
  ON phases FOR SELECT TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can insert phases"
  ON phases FOR INSERT TO authenticated WITH CHECK (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Managers can update phases"
  ON phases FOR UPDATE TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Managers can delete phases"
  ON phases FOR DELETE TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

-- =============================================
-- CATEGORIES POLICIES
-- =============================================
CREATE POLICY "Members can view categories"
  ON categories FOR SELECT TO authenticated USING (
    phase_id IN (
      SELECT id FROM phases WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can insert categories"
  ON categories FOR INSERT TO authenticated WITH CHECK (
    phase_id IN (
      SELECT id FROM phases WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND role = 'manager'
      )
    )
  );

CREATE POLICY "Managers can update categories"
  ON categories FOR UPDATE TO authenticated USING (
    phase_id IN (
      SELECT id FROM phases WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND role = 'manager'
      )
    )
  );

CREATE POLICY "Managers can delete categories"
  ON categories FOR DELETE TO authenticated USING (
    phase_id IN (
      SELECT id FROM phases WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND role = 'manager'
      )
    )
  );

-- =============================================
-- TASKS POLICIES
-- =============================================
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

CREATE POLICY "Members can update tasks"
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

-- =============================================
-- TASK COMMENTS POLICIES
-- =============================================
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

-- =============================================
-- INVITATIONS POLICIES
-- =============================================
CREATE POLICY "Managers can manage invitations"
  ON invitations FOR ALL TO authenticated USING (
    project_id IN (SELECT project_id FROM project_members
                   WHERE user_id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Users can view their own invitations"
  ON invitations FOR SELECT TO authenticated USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
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
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'manager');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_new_project();

-- Auto-accept invitations when invited user signs up
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN
    SELECT * FROM public.invitations
    WHERE email = NEW.email AND status = 'pending'
  LOOP
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (inv.project_id, NEW.id, inv.role)
    ON CONFLICT (project_id, user_id) DO NOTHING;

    UPDATE public.invitations SET status = 'accepted' WHERE id = inv.id;
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
