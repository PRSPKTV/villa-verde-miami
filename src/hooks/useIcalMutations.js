import { supabase } from '@/lib/supabase';

export async function addConnection(propertySlug, platform, icalUrl, platformLabel) {
  const { data, error } = await supabase
    .from('ical_connections')
    .insert({
      property_slug: propertySlug,
      platform,
      ical_url: icalUrl,
      platform_label: platformLabel || null,
      sync_status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateConnection(id, data) {
  const { data: updated, error } = await supabase
    .from('ical_connections')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteConnection(id) {
  const { error } = await supabase
    .from('ical_connections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function triggerSync(connectionId) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${url}/functions/v1/sync-calendar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ connectionId }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Sync failed: ${errorBody}`);
  }

  return response.json();
}
