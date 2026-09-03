-- Fix project INSERT policy - make it simpler
-- and auto-set created_by via trigger instead of relying on frontend

-- Drop any prior INSERT policy (both historical names) so this is idempotent.
-- The restrictive version must be removed or the CREATE below clashes by name
-- and the permissive policy never takes effect (the bug behind project-create 403s).
DROP POLICY IF EXISTS "Any authenticated user can create projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;

-- Create a more permissive INSERT policy
CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (true);

-- Auto-set created_by to the current user if not provided
CREATE OR REPLACE FUNCTION set_project_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_project_creator_trigger ON projects;
CREATE TRIGGER set_project_creator_trigger
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION set_project_creator();
