import { supabase } from './supabaseClient';

export const fetchPhases = async (projectId) => {
  let query = supabase.from('phases').select('*').order('sort_order');
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createPhaseApi = async (phase) => {
  const { data, error } = await supabase
    .from('phases')
    .insert(phase)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updatePhaseApi = async (id, updates) => {
  const { data, error } = await supabase
    .from('phases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePhaseApi = async (id) => {
  const { error } = await supabase.from('phases').delete().eq('id', id);
  if (error) throw error;
};
