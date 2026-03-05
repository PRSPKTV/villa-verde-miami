import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useNeighborhood() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('neighborhood_highlights')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else setData(rows || []);
        setLoading(false);
      });
  }, []);

  return { neighborhood: data, loading, error };
}
