-- =============================================================
-- 13_drop_legacy_autoaccept.sql  (Phase 4 cutover)
--
-- Removes the pre-token invitation machinery now that acceptance goes through
-- the secure token RPCs (migration 12) + the send-invite Edge Function.
--
-- Why this matters for security: `handle_invitation_acceptance` auto-joined
-- ANY new signup whose email matched a pending invite — i.e. knowing the
-- invited email was enough to join, bypassing the token. Acceptance is now
-- explicit via accept_invitation(token), so this trigger is removed.
-- =============================================================

-- Legacy auto-accept on signup (email match) — superseded by accept_invitation.
DROP TRIGGER IF EXISTS on_user_accepts_invite ON auth.users;
DROP FUNCTION IF EXISTS handle_invitation_acceptance();

-- Legacy invite RPC (added existing users directly / created token-less invites)
-- — superseded by create_project_invitation + the send-invite Edge Function.
DROP FUNCTION IF EXISTS invite_user_to_project(UUID, TEXT, TEXT);
