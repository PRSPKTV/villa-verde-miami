import { supabase } from '@/lib/supabase';

export function useBlogMutations() {
  const createPost = async (data) => {
    const { data: row, error } = await supabase.from('blog_posts').insert(data).select().single();
    if (error) throw error;
    return row;
  };

  const updatePost = async (id, data) => {
    const { data: row, error } = await supabase.from('blog_posts').update(data).eq('id', id).select().single();
    if (error) throw error;
    return row;
  };

  const deletePost = async (id) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  };

  const togglePublish = async (id, isPublished) => {
    const update = { is_published: isPublished };
    if (isPublished) update.published_at = new Date().toISOString();
    const { error } = await supabase.from('blog_posts').update(update).eq('id', id);
    if (error) throw error;
  };

  return { createPost, updatePost, deletePost, togglePublish };
}
