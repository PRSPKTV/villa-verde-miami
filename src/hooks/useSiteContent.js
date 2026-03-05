import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSiteContent(key) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!key) { setLoading(false); return; }

    supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .single()
      .then(({ data: row, error: err }) => {
        if (err) setError(err.message);
        else setData(row?.value || null);
        setLoading(false);
      });
  }, [key]);

  return { content: data, loading, error };
}
