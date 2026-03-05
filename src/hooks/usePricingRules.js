import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePricingRules(propertySlug) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    if (!propertySlug) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('property_slug', propertySlug)
      .order('priority', { ascending: false });
    if (err) setError(err);
    else setRules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [propertySlug]);

  return { rules, loading, error, refetch: fetch };
}
