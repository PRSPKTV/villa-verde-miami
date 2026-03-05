import { supabase } from '@/lib/supabase';

export async function createSection(propertySlug, data) {
  const { data: created, error } = await supabase
    .from('guest_guidebook')
    .insert({
      property_slug: propertySlug,
      section_type: data.section_type,
      title: data.title,
      content: data.content || {},
      sort_order: data.sort_order ?? 0,
      is_published: data.is_published ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function updateSection(id, data) {
  const { data: updated, error } = await supabase
    .from('guest_guidebook')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteSection(id) {
  const { error } = await supabase
    .from('guest_guidebook')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reorderSections(propertySlug, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('guest_guidebook')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('property_slug', propertySlug)
  );

  const results = await Promise.all(updates);

  for (const result of results) {
    if (result.error) throw result.error;
  }
}

export async function toggleSectionPublish(id, isPublished) {
  const { data: updated, error } = await supabase
    .from('guest_guidebook')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}
