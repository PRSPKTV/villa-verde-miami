import { supabase } from '@/lib/supabase';

export function useCalendarMutations() {
  const blockDates = async (propertySlug, dates) => {
    const rows = dates.map(date => ({
      property_slug: propertySlug,
      date,
      is_blocked: true,
      source: 'manual',
      summary: 'Blocked by owner',
    }));

    const { error } = await supabase
      .from('calendar_availability')
      .upsert(rows, { onConflict: 'property_slug,date' });
    if (error) throw error;
  };

  const unblockDates = async (propertySlug, dates) => {
    const { error } = await supabase
      .from('calendar_availability')
      .delete()
      .eq('property_slug', propertySlug)
      .in('date', dates);
    if (error) throw error;
  };

  const toggleDate = async (propertySlug, date, isCurrentlyBlocked) => {
    if (isCurrentlyBlocked) {
      await unblockDates(propertySlug, [date]);
    } else {
      await blockDates(propertySlug, [date]);
    }
  };

  return { blockDates, unblockDates, toggleDate };
}
