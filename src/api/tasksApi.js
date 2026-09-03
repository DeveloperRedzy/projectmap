import { supabase } from './supabaseClient';

export const fetchTasks = async (categoryIds) => {
  let query = supabase.from('tasks').select('*').order('sort_order');
  if (categoryIds && categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createTaskApi = async (task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTaskApi = async (id, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTaskApi = async (id) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
};

export const toggleTaskApi = async (id, completed, userId) => {
  const updates = completed
    ? { completed: 100, completed_by: userId, completed_at: new Date().toISOString() }
    : { completed: 0, completed_by: null, completed_at: null };

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const assignTaskApi = async (id, userId) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ assigned_to: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const moveTaskApi = async (id, categoryId) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ category_id: categoryId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
