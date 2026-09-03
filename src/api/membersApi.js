import { supabase } from './supabaseClient';

export const fetchProjectMembers = async (projectId) => {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      *,
      profiles:user_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('project_id', projectId);
  if (error) throw error;
  return data;
};

export const removeMemberApi = async (projectId, userId) => {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);
  if (error) throw error;
};

// Invitation flow lives in invitationsApi.js (secure tokenized invites via the
// send-invite Edge Function + the get/accept/revoke RPCs).
