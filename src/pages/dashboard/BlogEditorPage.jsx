import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useBlogMutations } from '@/hooks/useBlogMutations';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Type, Image, List, Heading } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Paragraph', icon: Type },
  { type: 'heading', label: 'Heading', icon: Heading },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'list', label: 'List', icon: List },
];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { createPost, updatePost } = useBlogMutations();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    cover_image: '',
    author: '',
    read_time: '',
    date: new Date().toISOString().split('T')[0],
    content: [{ type: 'paragraph', text: '' }],
    is_published: false,
  });

  useEffect(() => {
    if (isNew) return;
    supabase.from('blog_posts').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          category: data.category || '',
          excerpt: data.excerpt || '',
          cover_image: data.cover_image || '',
          author: data.author || '',
          read_time: data.read_time || '',
          date: data.date || '',
          content: data.content || [{ type: 'paragraph', text: '' }],
          is_published: data.is_published || false,
        });
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const updateField = (field, value) => {
    setForm(f => {
      const updated = { ...f, [field]: value };
      if (field === 'title' && (isNew || f.slug === generateSlug(f.title))) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const updateBlock = (index, updates) => {
    setForm(f => ({
      ...f,
      content: f.content.map((block, i) => i === index ? { ...block, ...updates } : block),
    }));
  };

  const addBlock = (type) => {
    const block = type === 'list' ? { type, items: [''] } : type === 'image' ? { type, src: '', alt: '', caption: '' } : type === 'heading' ? { type, text: '', level: 2 } : { type, text: '' };
    setForm(f => ({ ...f, content: [...f.content, block] }));
  };

  const removeBlock = (index) => {
    setForm(f => ({ ...f, content: f.content.filter((_, i) => i !== index) }));
  };

  const moveBlock = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= form.content.length) return;
    setForm(f => {
      const blocks = [...f.content];
      [blocks[index], blocks[newIdx]] = [blocks[newIdx], blocks[index]];
      return { ...f, content: blocks };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        excerpt: form.excerpt,
        cover_image: form.cover_image,
        author: form.author,
        read_time: form.read_time,
        date: form.date,
        content: form.content,
        is_published: form.is_published,
      };
      if (form.is_published && !payload.published_at) {
        payload.published_at = new Date().toISOString();
      }
      if (isNew) {
        await createPost(payload);
      } else {
        await updatePost(id, payload);
      }
      navigate('/dashboard/content');
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/content')} className="p-2 rounded-lg hover:bg-verde-50 transition-colors text-verde-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-heading text-2xl font-bold text-verde-800">{isNew ? 'New Post' : 'Edit Post'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-body text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={e => updateField('is_published', e.target.checked)} className="rounded border-verde-300 text-verde-500 focus:ring-verde-400" />
            Published
          </label>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Title</label>
            <input value={form.title} onChange={e => updateField('title', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Slug</label>
            <input value={form.slug} onChange={e => updateField('slug', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-data text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Category</label>
            <input value={form.category} onChange={e => updateField('category', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Author</label>
            <input value={form.author} onChange={e => updateField('author', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Cover Image URL</label>
            <input value={form.cover_image} onChange={e => updateField('cover_image', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Read Time</label>
              <input value={form.read_time} onChange={e => updateField('read_time', e.target.value)} placeholder="5 min read" className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            </div>
            <div>
              <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => updateField('date', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Excerpt</label>
          <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
        </div>
      </div>

      {/* Content Blocks */}
      <div className="mb-4">
        <h2 className="font-heading text-lg font-bold text-verde-800 mb-3">Content Blocks</h2>
        <div className="space-y-3">
          {form.content.map((block, i) => (
            <div key={i} className="bg-surface rounded-xl border border-verde-100 shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-data text-[10px] uppercase text-text-muted tracking-wider">{block.type}</span>
                <div className="flex-1" />
                <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="p-1 rounded text-text-muted hover:bg-verde-50 disabled:opacity-30"><GripVertical size={12} /></button>
                <button onClick={() => moveBlock(i, 1)} disabled={i === form.content.length - 1} className="p-1 rounded text-text-muted hover:bg-verde-50 disabled:opacity-30 rotate-180"><GripVertical size={12} /></button>
                <button onClick={() => removeBlock(i)} className="p-1 rounded text-red-400 hover:bg-red-50"><Trash2 size={12} /></button>
              </div>

              {block.type === 'paragraph' && (
                <textarea value={block.text} onChange={e => updateBlock(i, { text: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" placeholder="Paragraph text..." />
              )}

              {block.type === 'heading' && (
                <div className="flex gap-2">
                  <select value={block.level || 2} onChange={e => updateBlock(i, { level: Number(e.target.value) })} className="px-2 py-2 rounded-lg border border-verde-200 font-body text-sm">
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                    <option value={4}>H4</option>
                  </select>
                  <input value={block.text} onChange={e => updateBlock(i, { text: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" placeholder="Heading text..." />
                </div>
              )}

              {block.type === 'image' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input value={block.src || ''} onChange={e => updateBlock(i, { src: e.target.value })} placeholder="Image URL" className="md:col-span-2 px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
                  <input value={block.alt || ''} onChange={e => updateBlock(i, { alt: e.target.value })} placeholder="Alt text" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
                  <input value={block.caption || ''} onChange={e => updateBlock(i, { caption: e.target.value })} placeholder="Caption (optional)" className="md:col-span-3 px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
                </div>
              )}

              {block.type === 'list' && (
                <div className="space-y-2">
                  {(block.items || ['']).map((item, j) => (
                    <div key={j} className="flex gap-2">
                      <span className="font-data text-xs text-text-muted pt-2">{j + 1}.</span>
                      <input
                        value={item}
                        onChange={e => {
                          const items = [...(block.items || [''])];
                          items[j] = e.target.value;
                          updateBlock(i, { items });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
                      />
                      <button
                        onClick={() => {
                          const items = (block.items || ['']).filter((_, k) => k !== j);
                          updateBlock(i, { items: items.length ? items : [''] });
                        }}
                        className="p-1 text-red-400 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateBlock(i, { items: [...(block.items || ['']), ''] })}
                    className="flex items-center gap-1 text-verde-500 font-body text-xs hover:underline"
                  >
                    <Plus size={12} /> Add item
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Block */}
      <div className="flex items-center gap-2 pb-8">
        <span className="font-body text-sm text-text-muted">Add block:</span>
        {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
          <button key={type} onClick={() => addBlock(type)} className="flex items-center gap-1.5 px-3 py-1.5 bg-verde-50 text-verde-600 rounded-lg font-body text-xs font-medium hover:bg-verde-100 transition-colors">
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
