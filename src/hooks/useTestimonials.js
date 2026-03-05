import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useTestimonials() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else setData(rows || []);
        setLoading(false);
      });
  }, []);

  return { testimonials: data, loading, error };
}
