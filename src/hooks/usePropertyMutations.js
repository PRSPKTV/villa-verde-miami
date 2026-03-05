import { supabase } from '@/lib/supabase';

export function usePropertyMutations() {
  const createProperty = async (data) => {
    const { data: row, error } = await supabase.from('properties').insert(data).select().single();
    if (error) throw error;
    return row;
  };

  const updateProperty = async (id, data) => {
    const { data: row, error } = await supabase.from('properties').update(data).eq('id', id).select().single();
    if (error) throw error;
    return row;
  };

  const deleteProperty = async (id) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
  };

  const togglePublish = async (id, isPublished) => {
    const { error } = await supabase.from('properties').update({ is_published: isPublished }).eq('id', id);
    if (error) throw error;
  };

  return { createProperty, updateProperty, deleteProperty, togglePublish };
}
