import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useBlogPosts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else {
          // Map cover_image to image for backward compat with components
          const mapped = (rows || []).map(p => ({ ...p, image: p.cover_image }));
          setData(mapped);
        }
        setLoading(false);
      });
  }, []);

  return { blogPosts: data, loading, error };
}
