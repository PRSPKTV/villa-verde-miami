import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useIcalConnections(propertySlug) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnections = async () => {
    if (!propertySlug) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('ical_connections')
        .select('*')
        .eq('property_slug', propertySlug)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setConnections(data || []);
    } catch (err) {
      console.error('Error fetching iCal connections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [propertySlug]);

  return { connections, loading, error, refetch: fetchConnections };
}
