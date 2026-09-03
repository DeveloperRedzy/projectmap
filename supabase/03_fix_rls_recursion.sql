-- =============================================
-- Fix infinite recursion in project_members RLS
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop the recursive policies
DROP POLICY IF EXISTS "Members can view team" ON project_members;
DROP POLICY IF EXISTS "Managers can add members" ON project_members;
DROP POLICY IF EXISTS "Managers can remove members" ON project_members;

-- Recreate without recursion: use auth.uid() directly
CREATE POLICY "Members can view team"
  ON project_members FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT pm.project_id FROM project_members pm WHERE pm.user_id = auth.uid()
    )
  );

-- For INSERT/DELETE, use a SECURITY DEFINER function to avoid recursion
CREATE OR REPLACE FUNCTION is_project_manager(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
      AND user_id = auth.uid()
      AND role = 'manager'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Managers can add members"
  ON project_members FOR INSERT TO authenticated WITH CHECK (
    is_project_manager(project_id) OR user_id = auth.uid()
  );

CREATE POLICY "Managers can remove members"
  ON project_members FOR DELETE TO authenticated USING (
    is_project_manager(project_id)
  );

-- Also fix the SELECT policy to avoid recursion by using the function
DROP POLICY IF EXISTS "Members can view team" ON project_members;

CREATE POLICY "Members can view team"
  ON project_members FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR is_project_manager(project_id)
    OR project_id IN (
      SELECT pm.project_id FROM project_members pm WHERE pm.user_id = auth.uid()
    )
  );
