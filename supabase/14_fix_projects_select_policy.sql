-- =============================================================
-- 14_fix_projects_select_policy.sql
--
-- Fix: creating a project failed with 42501 ("new row violates row-level
-- security policy for projects") whenever the client used INSERT ... RETURNING
-- (which PostgREST always does for `.select()` / return=representation).
--
-- Why: INSERT ... RETURNING also applies the SELECT policy to the new row.
-- The SELECT policy only allowed rows where the user is already a project
-- member (`id IN (get_my_project_ids())`), but the creator's membership is
-- added by the AFTER-INSERT trigger, which runs *after* RETURNING is
-- evaluated — so the just-created row wasn't yet visible and the insert was
-- rejected.
--
-- Allowing the creator to see their own project (created_by, set by the
-- BEFORE-INSERT trigger and thus present at RETURNING time) closes the gap and
-- is also correct on its own (a creator should always see their project).
-- =============================================================

DROP POLICY IF EXISTS "Members can view projects" ON projects;
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT TO authenticated
  USING (
    id IN (SELECT get_my_project_ids())
    OR created_by = auth.uid()
  );
