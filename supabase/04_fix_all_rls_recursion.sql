-- =============================================
-- Fix ALL infinite recursion in RLS policies
-- The root cause: policies on table X query project_members,
-- which triggers project_members' own RLS, causing a loop.
-- Solution: use SECURITY DEFINER functions that bypass RLS.
-- =============================================

-- Helper function: get all project IDs the current user is a member of
CREATE OR REPLACE FUNCTION get_my_project_ids()
RETURNS SETOF UUID AS $$
  SELECT project_id FROM project_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get all phase IDs the current user can access
CREATE OR REPLACE FUNCTION get_my_phase_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM phases WHERE project_id IN (SELECT get_my_project_ids());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get all category IDs the current user can access
CREATE OR REPLACE FUNCTION get_my_category_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM categories WHERE phase_id IN (SELECT get_my_phase_ids());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get all task IDs the current user can access
CREATE OR REPLACE FUNCTION get_my_task_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM tasks WHERE category_id IN (SELECT get_my_category_ids());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- Drop ALL existing policies
-- =============================================
DROP POLICY IF EXISTS "Members can view team" ON project_members;
DROP POLICY IF EXISTS "Managers can add members" ON project_members;
DROP POLICY IF EXISTS "Managers can remove members" ON project_members;

DROP POLICY IF EXISTS "Members can view projects" ON projects;
DROP POLICY IF EXISTS "Any authenticated user can create projects" ON projects;
DROP POLICY IF EXISTS "Managers can update projects" ON projects;
DROP POLICY IF EXISTS "Managers can delete projects" ON projects;

DROP POLICY IF EXISTS "Members can view phases" ON phases;
DROP POLICY IF EXISTS "Managers can insert phases" ON phases;
DROP POLICY IF EXISTS "Managers can update phases" ON phases;
DROP POLICY IF EXISTS "Managers can delete phases" ON phases;

DROP POLICY IF EXISTS "Members can view categories" ON categories;
DROP POLICY IF EXISTS "Managers can insert categories" ON categories;
DROP POLICY IF EXISTS "Managers can update categories" ON categories;
DROP POLICY IF EXISTS "Managers can delete categories" ON categories;

DROP POLICY IF EXISTS "Members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can delete tasks" ON tasks;

DROP POLICY IF EXISTS "Members can view comments" ON task_comments;
DROP POLICY IF EXISTS "Members can create comments" ON task_comments;
DROP POLICY IF EXISTS "Authors can update own comments" ON task_comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON task_comments;

DROP POLICY IF EXISTS "Managers can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;

-- =============================================
-- Recreate ALL policies using helper functions
-- =============================================

-- PROJECT MEMBERS
CREATE POLICY "Members can view team"
  ON project_members FOR SELECT TO authenticated
  USING (project_id IN (SELECT get_my_project_ids()));

CREATE POLICY "Managers can add members"
  ON project_members FOR INSERT TO authenticated
  WITH CHECK (is_project_manager(project_id) OR user_id = auth.uid());

CREATE POLICY "Managers can remove members"
  ON project_members FOR DELETE TO authenticated
  USING (is_project_manager(project_id));

-- PROJECTS
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT TO authenticated
  USING (id IN (SELECT get_my_project_ids()));

CREATE POLICY "Any authenticated user can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Managers can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (is_project_manager(id));

CREATE POLICY "Managers can delete projects"
  ON projects FOR DELETE TO authenticated
  USING (is_project_manager(id));

-- PHASES
CREATE POLICY "Members can view phases"
  ON phases FOR SELECT TO authenticated
  USING (project_id IN (SELECT get_my_project_ids()));

CREATE POLICY "Managers can insert phases"
  ON phases FOR INSERT TO authenticated
  WITH CHECK (is_project_manager(project_id));

CREATE POLICY "Managers can update phases"
  ON phases FOR UPDATE TO authenticated
  USING (is_project_manager(project_id));

CREATE POLICY "Managers can delete phases"
  ON phases FOR DELETE TO authenticated
  USING (is_project_manager(project_id));

-- CATEGORIES
CREATE POLICY "Members can view categories"
  ON categories FOR SELECT TO authenticated
  USING (phase_id IN (SELECT get_my_phase_ids()));

CREATE POLICY "Managers can insert categories"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (phase_id IN (
    SELECT id FROM phases WHERE is_project_manager(project_id)
  ));

CREATE POLICY "Managers can update categories"
  ON categories FOR UPDATE TO authenticated
  USING (phase_id IN (
    SELECT id FROM phases WHERE is_project_manager(project_id)
  ));

CREATE POLICY "Managers can delete categories"
  ON categories FOR DELETE TO authenticated
  USING (phase_id IN (
    SELECT id FROM phases WHERE is_project_manager(project_id)
  ));

-- TASKS
CREATE POLICY "Members can view tasks"
  ON tasks FOR SELECT TO authenticated
  USING (category_id IN (SELECT get_my_category_ids()));

CREATE POLICY "Managers can insert tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (category_id IN (SELECT get_my_category_ids()));

CREATE POLICY "Members can update tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (category_id IN (SELECT get_my_category_ids()));

CREATE POLICY "Managers can delete tasks"
  ON tasks FOR DELETE TO authenticated
  USING (category_id IN (SELECT get_my_category_ids()));

-- TASK COMMENTS
CREATE POLICY "Members can view comments"
  ON task_comments FOR SELECT TO authenticated
  USING (task_id IN (SELECT get_my_task_ids()));

CREATE POLICY "Members can create comments"
  ON task_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND task_id IN (SELECT get_my_task_ids()));

CREATE POLICY "Authors can update own comments"
  ON task_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authors can delete own comments"
  ON task_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- INVITATIONS
CREATE POLICY "Managers can manage invitations"
  ON invitations FOR ALL TO authenticated
  USING (is_project_manager(project_id));

CREATE POLICY "Users can view their own invitations"
  ON invitations FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
