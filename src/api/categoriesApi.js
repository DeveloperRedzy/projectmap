import { supabase } from './supabaseClient';

export const fetchCategories = async (phaseIds) => {
  let query = supabase.from('categories').select('*').order('sort_order');
  if (phaseIds && phaseIds.length > 0) {
    query = query.in('phase_id', phaseIds);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createCategoryApi = async (category) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCategoryApi = async (id, updates) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteCategoryApi = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};
