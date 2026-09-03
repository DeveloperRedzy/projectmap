import { supabase } from './supabaseClient';

/**
 * Send a secure, tokenized invitation email via the send-invite Edge Function.
 * The function authorizes the caller (manager-only) and emails the accept link.
 * Returns { status: 'invited' | 'already_member', email, ... }.
 */
export const sendInvite = async (projectId, email, role = 'member') => {
  const { data, error } = await supabase.functions.invoke('send-invite', {
    body: { projectId, email, role },
  });
  if (error) {
    // Surface the function's JSON error message when available. On email
    // delivery failures the invitation still exists and the body carries the
    // accept link, so pass it along for the UI to offer manually.
    let message = error.message;
    let devInviteUrl;
    try {
      const body = await error.context?.json?.();
      if (body?.error) message = body.error;
      devInviteUrl = body?.devInviteUrl;
    } catch (_) {
      /* keep the default message */
    }
    const err = new Error(message);
    err.devInviteUrl = devInviteUrl;
    throw err;
  }
  return data;
};

/** All invitations for a project (any status), newest first. Managers only (RLS). */
export const fetchProjectInvitations = async (projectId) => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

/** Look up an invitation by its raw token (pre-login). Returns the RPC JSON. */
export const getInvitationByToken = async (token) => {
  const { data, error } = await supabase.rpc('get_invitation_by_token', {
    p_token: token,
  });
  if (error) throw error;
  return data;
};

/** Accept an invitation as the authenticated invitee. */
export const acceptInvitation = async (token) => {
  const { data, error } = await supabase.rpc('accept_invitation', {
    p_token: token,
  });
  if (error) throw error;
  return data;
};

/** Revoke a pending invitation (manager only). */
export const revokeInvitation = async (invitationId) => {
  const { data, error } = await supabase.rpc('revoke_invitation', {
    p_invitation_id: invitationId,
  });
  if (error) throw error;
  return data;
};
