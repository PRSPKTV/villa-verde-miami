import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCalendarPricing(propertySlug, startDate, endDate) {
  const [pricingData, setPricingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    if (!propertySlug || !startDate || !endDate) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('calendar_pricing')
      .select('*')
      .eq('property_slug', propertySlug)
      .gte('date', startDate)
      .lte('date', endDate);
    if (err) setError(err);
    else setPricingData(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [propertySlug, startDate, endDate]);

  return { pricingData, loading, error, refetch: fetch };
}
