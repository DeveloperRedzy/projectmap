-- Fix invitations policy that references auth.users (not accessible to client)
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;

-- Create helper function to get current user's email
CREATE OR REPLACE FUNCTION get_my_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate policy using the helper function
CREATE POLICY "Users can view their own invitations"
  ON invitations FOR SELECT TO authenticated
  USING (
    is_project_manager(project_id)
    OR email = get_my_email()
  );
