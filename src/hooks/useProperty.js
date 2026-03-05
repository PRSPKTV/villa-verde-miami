import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useProperty(slug) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setProperty(data);
        setLoading(false);
      });
  }, [slug]);

  return { property, loading, error };
}
