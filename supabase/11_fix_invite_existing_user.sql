-- Function to invite a user to a project
-- If user already exists → add directly to project_members
-- If user doesn't exist → create invitation record
CREATE OR REPLACE FUNCTION invite_user_to_project(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS JSON AS $$
DECLARE
  existing_user_id UUID;
BEGIN
  -- Check if user with this email already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = p_email;

  IF existing_user_id IS NOT NULL THEN
    -- User exists: add directly to project_members
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (p_project_id, existing_user_id, p_role)
    ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    -- Mark any pending invitation as accepted
    UPDATE invitations SET status = 'accepted'
    WHERE project_id = p_project_id AND email = p_email AND status = 'pending';

    RETURN json_build_object('status', 'added', 'user_id', existing_user_id);
  ELSE
    -- User doesn't exist: create invitation
    INSERT INTO invitations (project_id, email, role, invited_by, status)
    VALUES (p_project_id, p_email, p_role, auth.uid(), 'pending')
    ON CONFLICT (project_id, email) DO UPDATE SET
      role = EXCLUDED.role,
      status = 'pending',
      created_at = now(),
      expires_at = now() + INTERVAL '7 days';

    RETURN json_build_object('status', 'invited', 'email', p_email);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
