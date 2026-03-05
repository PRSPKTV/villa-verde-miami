import { supabase } from '@/lib/supabase';

export function useContentMutations() {
  // FAQ Items
  const createFAQ = async (data) => {
    const { data: row, error } = await supabase.from('faq_items').insert(data).select().single();
    if (error) throw error;
    return row;
  };

  const updateFAQ = async (id, data) => {
    const { error } = await supabase.from('faq_items').update(data).eq('id', id);
    if (error) throw error;
  };

  const deleteFAQ = async (id) => {
    const { error } = await supabase.from('faq_items').delete().eq('id', id);
    if (error) throw error;
  };

  // Testimonials
  const createTestimonial = async (data) => {
    const { data: row, error } = await supabase.from('testimonials').insert(data).select().single();
    if (error) throw error;
    return row;
  };

  const updateTestimonial = async (id, data) => {
    const { error } = await supabase.from('testimonials').update(data).eq('id', id);
    if (error) throw error;
  };

  const deleteTestimonial = async (id) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
  };

  // Neighborhood
  const createNeighborhood = async (data) => {
    const { data: row, error } = await supabase.from('neighborhood_highlights').insert(data).select().single();
    if (error) throw error;
    return row;
  };

  const updateNeighborhood = async (id, data) => {
    const { error } = await supabase.from('neighborhood_highlights').update(data).eq('id', id);
    if (error) throw error;
  };

  const deleteNeighborhood = async (id) => {
    const { error } = await supabase.from('neighborhood_highlights').delete().eq('id', id);
    if (error) throw error;
  };

  // Site Content
  const updateSiteContent = async (key, value) => {
    const { error } = await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  };

  return {
    createFAQ, updateFAQ, deleteFAQ,
    createTestimonial, updateTestimonial, deleteTestimonial,
    createNeighborhood, updateNeighborhood, deleteNeighborhood,
    updateSiteContent,
  };
}
