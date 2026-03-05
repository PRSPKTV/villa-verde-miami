import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);

    // Get all bookings with their latest message
    const { data: bookings, error: bErr } = await supabase
      .from('bookings')
      .select('id, confirmation_code, property_slug, property_name, check_in, check_out, guest_first_name, guest_last_name, guest_email, status')
      .order('created_at', { ascending: false });

    if (bErr) { setError(bErr); setLoading(false); return; }

    // Get message counts and latest message per booking
    const { data: messages, error: mErr } = await supabase
      .from('guest_messages')
      .select('booking_id, message, sender_type, is_read, created_at')
      .order('created_at', { ascending: false });

    if (mErr) { setError(mErr); setLoading(false); return; }

    // Also get email log entries as system messages
    const { data: emails, error: eErr } = await supabase
      .from('guest_emails_log')
      .select('booking_id, template, sent_to, created_at');

    const emailsByBooking = {};
    (emails || []).forEach(e => {
      if (!emailsByBooking[e.booking_id]) emailsByBooking[e.booking_id] = [];
      emailsByBooking[e.booking_id].push(e);
    });

    const messagesByBooking = {};
    (messages || []).forEach(m => {
      if (!messagesByBooking[m.booking_id]) messagesByBooking[m.booking_id] = [];
      messagesByBooking[m.booking_id].push(m);
    });

    const convos = (bookings || []).map(b => {
      const msgs = messagesByBooking[b.id] || [];
      const emailCount = (emailsByBooking[b.id] || []).length;
      const lastMsg = msgs[0];
      const unreadCount = msgs.filter(m => !m.is_read && m.sender_type !== 'host').length;

      return {
        booking: b,
        lastMessage: lastMsg,
        messageCount: msgs.length + emailCount,
        unreadCount,
      };
    }).filter(c => c.messageCount > 0 || c.booking.status === 'confirmed');

    convos.sort((a, b) => {
      const aTime = a.lastMessage?.created_at || a.booking.check_in;
      const bTime = b.lastMessage?.created_at || b.booking.check_in;
      return bTime > aTime ? 1 : -1;
    });

    setConversations(convos);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return { conversations, loading, error, refetch: fetch };
}

export function useMessages(bookingId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    if (!bookingId) return;
    setLoading(true);

    // Fetch messages and email log in parallel
    const [msgRes, emailRes] = await Promise.all([
      supabase.from('guest_messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true }),
      supabase.from('guest_emails_log').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true }),
    ]);

    if (msgRes.error) { setError(msgRes.error); setLoading(false); return; }

    // Merge email log as system messages
    const emailMsgs = (emailRes.data || []).map(e => ({
      id: `email-${e.id}`,
      booking_id: e.booking_id,
      sender_type: 'system',
      message: `Email sent: "${e.template}" to ${e.sent_to}`,
      is_read: true,
      created_at: e.created_at,
      _isEmail: true,
    }));

    const allMessages = [...(msgRes.data || []), ...emailMsgs].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    setMessages(allMessages);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [bookingId]);

  return { messages, loading, error, refetch: fetch };
}
