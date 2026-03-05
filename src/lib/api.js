const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function supabaseFunction(fnName, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Edge function ${fnName} failed`);
  }

  return data;
}

export async function createPaymentIntent(bookingData) {
  return supabaseFunction('create-payment-intent', bookingData);
}

export async function confirmBooking(bookingId, paymentIntentId) {
  return supabaseFunction('confirm-booking', { bookingId, paymentIntentId });
}

export async function getAvailability(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/get-availability?slug=${encodeURIComponent(slug)}`,
    {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch availability');
  return data.blockedDates;
}

export async function sendContactMessage({ name, email, subject, message }) {
  return supabaseFunction('send-contact', { name, email, subject, message });
}

export async function subscribeNewsletter(email) {
  return supabaseFunction('subscribe-newsletter', { email });
}

export async function syncCalendar(slug) {
  const url = slug
    ? `${SUPABASE_URL}/functions/v1/sync-calendar?slug=${encodeURIComponent(slug)}`
    : `${SUPABASE_URL}/functions/v1/sync-calendar`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Calendar sync failed');
  return data;
}
