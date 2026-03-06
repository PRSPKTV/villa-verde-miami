import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePriceLabsNeighborhood(propertySlug, startDate, endDate) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    if (!propertySlug || !startDate || !endDate) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: rows, error: err } = await supabase
        .from('pricelabs_neighborhood_daily')
        .select('*')
        .eq('property_slug', propertySlug)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (err) throw err;
      setData(rows || []);
    } catch (err) {
      console.error('Error fetching neighborhood data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [propertySlug, startDate, endDate]);

  return { data, loading, error, refetch: fetch };
}
