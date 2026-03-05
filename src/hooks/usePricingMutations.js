import { supabase } from '@/lib/supabase';

export function usePricingMutations() {
  const upsertDatePricing = async (propertySlug, date, data) => {
    const { error } = await supabase
      .from('calendar_pricing')
      .upsert({ property_slug: propertySlug, date, ...data, updated_at: new Date().toISOString() }, { onConflict: 'property_slug,date' });
    if (error) throw error;
  };

  const upsertBulkPricing = async (propertySlug, dates, data) => {
    const rows = dates.map(date => ({
      property_slug: propertySlug,
      date,
      ...data,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('calendar_pricing')
      .upsert(rows, { onConflict: 'property_slug,date' });
    if (error) throw error;
  };

  const deleteDatePricing = async (propertySlug, dates) => {
    const { error } = await supabase
      .from('calendar_pricing')
      .delete()
      .eq('property_slug', propertySlug)
      .in('date', dates);
    if (error) throw error;
  };

  const createPricingRule = async (data) => {
    const { data: row, error } = await supabase
      .from('pricing_rules')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return row;
  };

  const updatePricingRule = async (id, data) => {
    const { error } = await supabase
      .from('pricing_rules')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  };

  const deletePricingRule = async (id) => {
    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  return { upsertDatePricing, upsertBulkPricing, deleteDatePricing, createPricingRule, updatePricingRule, deletePricingRule };
}
