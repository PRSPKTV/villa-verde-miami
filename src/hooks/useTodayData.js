import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export function useTodayData() {
  const [data, setData] = useState({
    checkinsToday: [], checkoutsToday: [], upcomingBookings: [],
    stats: { totalBookings: 0, revenue: 0, properties: 0, occupancyRate: 0, upcoming: 0 },
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');

    Promise.all([
      supabase.from('bookings').select('*').eq('check_in', today).eq('status', 'confirmed'),
      supabase.from('bookings').select('*').eq('check_out', today).eq('status', 'confirmed'),
      supabase.from('bookings').select('*').eq('status', 'confirmed').gte('check_in', today).order('check_in').limit(7),
      supabase.from('bookings').select('total, status').eq('status', 'confirmed'),
      supabase.from('properties').select('id'),
      supabase.from('guest_messages').select('id', { count: 'exact' }).eq('is_read', false).neq('sender_type', 'host'),
    ]).then(([ciRes, coRes, upRes, bkRes, prRes, msgRes]) => {
      const confirmed = bkRes.data || [];
      const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total || 0), 0);

      setData({
        checkinsToday: ciRes.data || [],
        checkoutsToday: coRes.data || [],
        upcomingBookings: upRes.data || [],
        stats: {
          totalBookings: confirmed.length,
          revenue: totalRevenue,
          properties: (prRes.data || []).length,
          upcoming: (upRes.data || []).length,
        },
        unreadMessages: msgRes.count || 0,
      });
      setLoading(false);
    });
  }, []);

  return { ...data, loading };
}
