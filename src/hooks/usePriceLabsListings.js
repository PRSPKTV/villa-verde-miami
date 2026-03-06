import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePriceLabsListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('pricelabs_listing_map')
        .select('*')
        .order('pricelabs_name', { ascending: true });

      if (err) throw err;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching PriceLabs listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { listings, loading, error, refetch: fetch };
}
