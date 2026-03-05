import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useFAQ() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('faq_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }

        // Group by category to match existing faqData shape
        const grouped = [];
        const catMap = {};
        for (const item of (rows || [])) {
          if (!catMap[item.category]) {
            catMap[item.category] = { category: item.category, items: [] };
            grouped.push(catMap[item.category]);
          }
          catMap[item.category].items.push(item);
        }
        setData(grouped);
        setLoading(false);
      });
  }, []);

  return { faqData: data, loading, error };
}
