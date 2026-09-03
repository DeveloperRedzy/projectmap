-- =============================================================
-- 12_secure_invitations.sql
-- Secure, tokenized project invitation flow.
--
-- Additive and non-breaking: extends the existing `invitations` table and
-- adds RPCs. The legacy `on_user_accepts_invite` trigger (auto-accept by
-- email match on signup) is intentionally LEFT IN PLACE here and is dropped
-- in the Phase 4 cutover migration, so no partial state is ever shipped.
--
-- Security model:
--   * A random token is generated server-side (Edge Function). Only its
--     SHA-256 hash is stored; the raw token lives solely in the email link.
--   * All RPCs accept the RAW token and hash it in SQL (pgcrypto), so there
--     is no client/Deno/Postgres hashing mismatch and the raw token is never
--     persisted.
--   * Authorization is enforced inside each SECURITY DEFINER function via
--     auth.uid() + is_project_manager(), since SECURITY DEFINER bypasses RLS.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ---------- Schema changes ----------

ALTER TABLE invitations ADD COLUMN IF NOT EXISTS token_hash TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Allow the 'revoked' status (was: pending | accepted | expired).
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_status_check;
ALTER TABLE invitations
  ADD CONSTRAINT invitations_status_check
  CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'));

-- A token, when present, must be unique. Partial index leaves legacy
-- token-less rows unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_hash_key
  ON invitations (token_hash) WHERE token_hash IS NOT NULL;

-- ---------- Helpers ----------

-- Centralizes token hashing so creation and lookup always agree.
CREATE OR REPLACE FUNCTION hash_invitation_token(p_token TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT encode(digest(p_token, 'sha256'), 'hex');
$$;

-- ---------- create_project_invitation ----------
-- Manager-only. Upserts a pending invitation for (project, email), storing
-- only the token hash. Reports whether the invitee already has an account
-- (so the email can say "log in" vs "sign up") and whether they are already
-- a member (in which case no invite is created).
CREATE OR REPLACE FUNCTION create_project_invitation(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_token TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_email TEXT := lower(trim(p_email));
  v_role TEXT := coalesce(nullif(trim(p_role), ''), 'member');
  v_existing_user_id UUID;
  v_invitation_id UUID;
BEGIN
  IF NOT is_project_manager(p_project_id) THEN
    RAISE EXCEPTION 'Not authorized: only project managers can invite'
      USING ERRCODE = '42501';
  END IF;

  IF v_role NOT IN ('manager', 'member') THEN
    RAISE EXCEPTION 'Invalid role: %', v_role USING ERRCODE = '22023';
  END IF;

  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_existing_user_id FROM auth.users WHERE lower(email) = v_email;

  -- Already a member? Do not create an invitation.
  IF v_existing_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id AND user_id = v_existing_user_id
  ) THEN
    RETURN json_build_object('status', 'already_member', 'email', v_email);
  END IF;

  INSERT INTO invitations (project_id, email, role, invited_by, status,
                           token_hash, created_at, expires_at, accepted_at)
  VALUES (p_project_id, v_email, v_role, auth.uid(), 'pending',
          hash_invitation_token(p_token), now(), now() + INTERVAL '7 days', NULL)
  ON CONFLICT (project_id, email) DO UPDATE
    SET role = EXCLUDED.role,
        invited_by = EXCLUDED.invited_by,
        status = 'pending',
        token_hash = EXCLUDED.token_hash,
        created_at = now(),
        expires_at = now() + INTERVAL '7 days',
        accepted_at = NULL
  RETURNING id INTO v_invitation_id;

  RETURN json_build_object(
    'status', 'invited',
    'invitation_id', v_invitation_id,
    'email', v_email,
    'role', v_role,
    'user_exists', v_existing_user_id IS NOT NULL
  );
END;
$$;

-- ---------- get_invitation_by_token ----------
-- Callable before login (the token IS the secret). Returns enough to render
-- the accept page. Computes an effective status so a past-due pending invite
-- reads as 'expired'.
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
DECLARE
  v_inv invitations%ROWTYPE;
  v_project_name TEXT;
  v_status TEXT;
BEGIN
  SELECT * INTO v_inv FROM invitations
  WHERE token_hash = hash_invitation_token(p_token);

  IF NOT FOUND THEN
    RETURN json_build_object('status', 'not_found');
  END IF;

  v_status := v_inv.status;
  IF v_status = 'pending' AND v_inv.expires_at < now() THEN
    v_status := 'expired';
  END IF;

  SELECT name INTO v_project_name FROM projects WHERE id = v_inv.project_id;

  RETURN json_build_object(
    'status', v_status,
    'email', v_inv.email,
    'role', v_inv.role,
    'project_id', v_inv.project_id,
    'project_name', v_project_name
  );
END;
$$;

-- ---------- accept_invitation ----------
-- Authenticated invitee accepts via the token. Verifies the logged-in user's
-- email matches the invite, the invite is pending and unexpired, then adds
-- membership (idempotent) and marks the invite accepted.
CREATE OR REPLACE FUNCTION accept_invitation(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_inv invitations%ROWTYPE;
  v_uid UUID := auth.uid();
  v_user_email TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_inv FROM invitations
  WHERE token_hash = hash_invitation_token(p_token);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invitation' USING ERRCODE = '22023';
  END IF;

  IF v_inv.status = 'revoked' THEN
    RAISE EXCEPTION 'This invitation has been revoked' USING ERRCODE = '22023';
  END IF;

  IF v_inv.status = 'expired' OR v_inv.expires_at < now() THEN
    RAISE EXCEPTION 'This invitation has expired' USING ERRCODE = '22023';
  END IF;

  SELECT lower(email) INTO v_user_email FROM auth.users WHERE id = v_uid;

  IF v_user_email IS DISTINCT FROM lower(v_inv.email) THEN
    RAISE EXCEPTION 'This invitation was issued for a different email address'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO project_members (project_id, user_id, role)
  VALUES (v_inv.project_id, v_uid, v_inv.role)
  ON CONFLICT (project_id, user_id) DO NOTHING;

  UPDATE invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = v_inv.id;

  RETURN json_build_object(
    'status', 'accepted',
    'project_id', v_inv.project_id,
    'role', v_inv.role
  );
END;
$$;

-- ---------- revoke_invitation ----------
-- Manager-only. Cancels a still-pending invitation.
CREATE OR REPLACE FUNCTION revoke_invitation(p_invitation_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_inv invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_inv FROM invitations WHERE id = p_invitation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = '22023';
  END IF;

  IF NOT is_project_manager(v_inv.project_id) THEN
    RAISE EXCEPTION 'Not authorized: only project managers can revoke invitations'
      USING ERRCODE = '42501';
  END IF;

  IF v_inv.status = 'accepted' THEN
    RAISE EXCEPTION 'Cannot revoke an already-accepted invitation'
      USING ERRCODE = '22023';
  END IF;

  UPDATE invitations SET status = 'revoked' WHERE id = p_invitation_id;

  RETURN json_build_object('status', 'revoked', 'invitation_id', p_invitation_id);
END;
$$;

-- ---------- Grants ----------
-- get_invitation_by_token is reachable pre-login; the rest require a session.
GRANT EXECUTE ON FUNCTION get_invitation_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION accept_invitation(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_project_invitation(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_invitation(UUID) TO authenticated;
