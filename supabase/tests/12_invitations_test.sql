-- Integration tests for the secure invitation RPCs (migration 12).
-- Run against a local Supabase DB:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/12_invitations_test.sql
-- Wrapped in a transaction that is rolled back, so it leaves no residue.
-- Any failed assertion RAISEs and aborts (visible as an error).

\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  c_instance UUID := '00000000-0000-0000-0000-000000000000';
  v_manager  UUID := '00000000-0000-0000-0000-000000000001';
  v_invitee  UUID := '00000000-0000-0000-0000-000000000002';
  v_wrong    UUID := '00000000-0000-0000-0000-000000000003';
  v_member   UUID := '00000000-0000-0000-0000-000000000004';
  v_gail     UUID := '00000000-0000-0000-0000-000000000005';
  v_project  UUID;
  v_inv_id   UUID;
  v_result   JSON;
  v_count    INT;
  v_status   TEXT;
  v_ok       BOOLEAN;
BEGIN
  -- ---- helper: insert a user (fires profile-create trigger) ----
  INSERT INTO auth.users (instance_id, id, aud, role, email, raw_user_meta_data,
                          created_at, updated_at, email_confirmed_at)
  VALUES
    (c_instance, v_manager, 'authenticated', 'authenticated', 'manager@test.com',
     '{"first_name":"Man","last_name":"Ager"}', now(), now(), now()),
    (c_instance, v_invitee, 'authenticated', 'authenticated', 'invitee@test.com',
     '{"first_name":"In","last_name":"Vitee"}', now(), now(), now()),
    (c_instance, v_wrong, 'authenticated', 'authenticated', 'wrong@test.com',
     '{"first_name":"Wr","last_name":"Ong"}', now(), now(), now()),
    (c_instance, v_member, 'authenticated', 'authenticated', 'member@test.com',
     '{"first_name":"Mem","last_name":"Ber"}', now(), now(), now()),
    (c_instance, v_gail, 'authenticated', 'authenticated', 'gail@test.com',
     '{"first_name":"Ga","last_name":"Il"}', now(), now(), now());

  -- act as the manager
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_manager::text)::text, true);

  -- create a project (trigger adds the creator as manager)
  INSERT INTO projects (name, start_date, end_date, created_by)
  VALUES ('Test Project', now(), now() + INTERVAL '30 days', v_manager)
  RETURNING id INTO v_project;

  SELECT count(*) INTO v_count FROM project_members
   WHERE project_id = v_project AND user_id = v_manager AND role = 'manager';
  IF v_count <> 1 THEN RAISE EXCEPTION 'SETUP FAILED: creator not auto-added as manager'; END IF;
  RAISE NOTICE 'PASS setup: project created, creator is manager';

  -- ===== A. create_project_invitation by a manager =====
  v_result := create_project_invitation(v_project, 'invitee@test.com', 'member', 'tokA');
  IF v_result->>'status' <> 'invited' THEN RAISE EXCEPTION 'A FAILED: %', v_result; END IF;
  IF (v_result->>'user_exists')::boolean IS NOT TRUE THEN RAISE EXCEPTION 'A FAILED: user_exists should be true'; END IF;
  SELECT status INTO v_status FROM invitations WHERE token_hash = hash_invitation_token('tokA');
  IF v_status <> 'pending' THEN RAISE EXCEPTION 'A FAILED: invite not pending'; END IF;
  RAISE NOTICE 'PASS A: manager creates tokenized invite (pending, user_exists)';

  -- ===== B. non-manager cannot invite =====
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_wrong::text)::text, true);
  v_ok := false;
  BEGIN
    PERFORM create_project_invitation(v_project, 'x@test.com', 'member', 'tokB');
  EXCEPTION WHEN sqlstate '42501' THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'B FAILED: non-manager was allowed to invite'; END IF;
  RAISE NOTICE 'PASS B: non-manager blocked from inviting';

  -- ===== C. get_invitation_by_token =====
  v_result := get_invitation_by_token('tokA');
  IF v_result->>'status' <> 'pending'
     OR v_result->>'email' <> 'invitee@test.com'
     OR v_result->>'project_name' <> 'Test Project' THEN
    RAISE EXCEPTION 'C FAILED: %', v_result;
  END IF;
  -- unknown token
  v_result := get_invitation_by_token('does-not-exist');
  IF v_result->>'status' <> 'not_found' THEN RAISE EXCEPTION 'C FAILED: unknown token not handled'; END IF;
  RAISE NOTICE 'PASS C: lookup returns details; unknown token -> not_found';

  -- ===== D. accept by the correct invitee (idempotent) =====
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_invitee::text)::text, true);
  v_result := accept_invitation('tokA');
  IF v_result->>'status' <> 'accepted' THEN RAISE EXCEPTION 'D FAILED: %', v_result; END IF;
  SELECT count(*) INTO v_count FROM project_members WHERE project_id = v_project AND user_id = v_invitee;
  IF v_count <> 1 THEN RAISE EXCEPTION 'D FAILED: invitee not added as member'; END IF;
  SELECT status INTO v_status FROM invitations WHERE token_hash = hash_invitation_token('tokA');
  IF v_status <> 'accepted' THEN RAISE EXCEPTION 'D FAILED: invite not marked accepted'; END IF;
  -- accept again -> still one membership
  PERFORM accept_invitation('tokA');
  SELECT count(*) INTO v_count FROM project_members WHERE project_id = v_project AND user_id = v_invitee;
  IF v_count <> 1 THEN RAISE EXCEPTION 'D FAILED: re-accept created duplicate membership'; END IF;
  RAISE NOTICE 'PASS D: correct invitee accepted; idempotent';

  -- ===== E. wrong-email account cannot accept =====
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_manager::text)::text, true);
  PERFORM create_project_invitation(v_project, 'gail@test.com', 'member', 'tokE');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_wrong::text)::text, true);
  v_ok := false;
  BEGIN
    PERFORM accept_invitation('tokE');
  EXCEPTION WHEN sqlstate '42501' THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'E FAILED: wrong-email account accepted invite'; END IF;
  RAISE NOTICE 'PASS E: wrong-email account blocked from accepting';

  -- ===== F. expired invitation =====
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_manager::text)::text, true);
  PERFORM create_project_invitation(v_project, 'member@test.com', 'member', 'tokF');
  UPDATE invitations SET expires_at = now() - INTERVAL '1 day'
    WHERE token_hash = hash_invitation_token('tokF');
  v_result := get_invitation_by_token('tokF');
  IF v_result->>'status' <> 'expired' THEN RAISE EXCEPTION 'F FAILED: not reported expired'; END IF;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member::text)::text, true);
  v_ok := false;
  BEGIN
    PERFORM accept_invitation('tokF');
  EXCEPTION WHEN sqlstate '22023' THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'F FAILED: expired invite was accepted'; END IF;
  RAISE NOTICE 'PASS F: expired invite reported and rejected';

  -- ===== G. revoke =====
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_manager::text)::text, true);
  v_result := create_project_invitation(v_project, 'gail@test.com', 'member', 'tokG'); -- re-invite gail (resend)
  SELECT id INTO v_inv_id FROM invitations WHERE token_hash = hash_invitation_token('tokG');
  v_result := revoke_invitation(v_inv_id);
  IF v_result->>'status' <> 'revoked' THEN RAISE EXCEPTION 'G FAILED: %', v_result; END IF;
  -- gail cannot accept a revoked invite
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_gail::text)::text, true);
  v_ok := false;
  BEGIN
    PERFORM accept_invitation('tokG');
  EXCEPTION WHEN sqlstate '22023' THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'G FAILED: revoked invite was accepted'; END IF;
  -- non-manager cannot revoke
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_wrong::text)::text, true);
  v_ok := false;
  BEGIN
    PERFORM revoke_invitation(v_inv_id);
  EXCEPTION WHEN sqlstate '42501' THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'G FAILED: non-manager revoked an invite'; END IF;
  RAISE NOTICE 'PASS G: revoke works; revoked invite rejected; non-manager cannot revoke';

  -- ===== H. cannot revoke an accepted invite; resend keeps one row =====
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_manager::text)::text, true);
  SELECT id INTO v_inv_id FROM invitations WHERE token_hash = hash_invitation_token('tokA'); -- accepted in D
  v_ok := false;
  BEGIN
    PERFORM revoke_invitation(v_inv_id);
  EXCEPTION WHEN sqlstate '22023' THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'H FAILED: accepted invite was revoked'; END IF;
  RAISE NOTICE 'PASS H: accepted invite cannot be revoked';

  -- ===== I. inviting an existing member returns already_member =====
  v_result := create_project_invitation(v_project, 'invitee@test.com', 'member', 'tokI');
  IF v_result->>'status' <> 'already_member' THEN RAISE EXCEPTION 'I FAILED: %', v_result; END IF;
  RAISE NOTICE 'PASS I: inviting an existing member -> already_member';

  -- ===== J. dedup: re-inviting the same pending email keeps a single row =====
  PERFORM create_project_invitation(v_project, 'member@test.com', 'member', 'tokF2'); -- resend over expired
  SELECT count(*) INTO v_count FROM invitations WHERE project_id = v_project AND email = 'member@test.com';
  IF v_count <> 1 THEN RAISE EXCEPTION 'J FAILED: resend created duplicate row (count=%)', v_count; END IF;
  SELECT status INTO v_status FROM invitations WHERE token_hash = hash_invitation_token('tokF2');
  IF v_status <> 'pending' THEN RAISE EXCEPTION 'J FAILED: resend did not reset to pending'; END IF;
  RAISE NOTICE 'PASS J: resend upserts a single row, reset to pending';

  -- ===== K. project deletion cascades; token no longer resolves =====
  DELETE FROM projects WHERE id = v_project;
  v_result := get_invitation_by_token('tokF2');
  IF v_result->>'status' <> 'not_found' THEN RAISE EXCEPTION 'K FAILED: invite survived project deletion'; END IF;
  RAISE NOTICE 'PASS K: invitations cascade-deleted with the project';

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'ALL INVITATION RPC TESTS PASSED';
END $$;

ROLLBACK;
