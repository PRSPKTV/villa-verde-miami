import { supabase } from '@/lib/supabase';

export function useMessageMutations() {
  const sendMessage = async (bookingId, message, senderType = 'host') => {
    const { data, error } = await supabase
      .from('guest_messages')
      .insert({ booking_id: bookingId, sender_type: senderType, message, is_read: senderType === 'host' })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const markAsRead = async (messageIds) => {
    const { error } = await supabase
      .from('guest_messages')
      .update({ is_read: true })
      .in('id', messageIds);
    if (error) throw error;
  };

  const createTemplate = async (data) => {
    const { data: row, error } = await supabase
      .from('message_templates')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return row;
  };

  const updateTemplate = async (id, data) => {
    const { error } = await supabase
      .from('message_templates')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  };

  const deleteTemplate = async (id) => {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  const toggleTemplate = async (id, isActive) => {
    const { error } = await supabase
      .from('message_templates')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  };

  return { sendMessage, markAsRead, createTemplate, updateTemplate, deleteTemplate, toggleTemplate };
}
