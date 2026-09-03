import { supabase } from './supabaseClient';

/** task_id of every comment visible to the user (RLS-scoped), for badge counts. */
export const fetchAllCommentTaskIds = async () => {
  const { data, error } = await supabase.from('task_comments').select('task_id');
  if (error) throw error;
  return data;
};

export const fetchComments = async (taskId) => {
  const { data, error } = await supabase
    .from('task_comments')
    .select(`
      *,
      profiles:user_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const createCommentApi = async (taskId, userId, content) => {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, user_id: userId, content })
    .select(`
      *,
      profiles:user_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

export const updateCommentApi = async (id, content) => {
  const { data, error } = await supabase
    .from('task_comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteCommentApi = async (id) => {
  const { error } = await supabase.from('task_comments').delete().eq('id', id);
  if (error) throw error;
};
