import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePriceLabsMarketKPI(propertySlug, startMonth, endMonth) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    if (!propertySlug || !startMonth || !endMonth) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: rows, error: err } = await supabase
        .from('pricelabs_market_kpi')
        .select('*')
        .eq('property_slug', propertySlug)
        .gte('month', startMonth)
        .lte('month', endMonth)
        .order('month', { ascending: true });

      if (err) throw err;
      setData(rows || []);
    } catch (err) {
      console.error('Error fetching market KPI data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [propertySlug, startMonth, endMonth]);

  return { data, loading, error, refetch: fetch };
}
