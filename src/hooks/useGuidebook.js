import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useGuidebook(propertySlug) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSections = async () => {
    if (!propertySlug) {
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('guest_guidebook')
        .select('*')
        .eq('property_slug', propertySlug)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching guidebook sections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [propertySlug]);

  return { sections, loading, error, refetch: fetchSections };
}
