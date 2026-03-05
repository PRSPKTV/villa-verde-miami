import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useContentMutations } from '@/hooks/useContentMutations';
import { useBlogMutations } from '@/hooks/useBlogMutations';
import { FileText, HelpCircle, Star, MapPin, Globe, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';

const tabs = [
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'testimonials', label: 'Testimonials', icon: Star },
  { id: 'neighborhood', label: 'Neighborhood', icon: MapPin },
  { id: 'site', label: 'Site Content', icon: Globe },
];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('blog');

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-verde-800">Content</h1>
        <p className="text-text-secondary font-body mt-1">Manage all site content from one place.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-verde-50 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors ${
              activeTab === id ? 'bg-surface text-verde-800 shadow-sm' : 'text-verde-600 hover:text-verde-800'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'blog' && <BlogTab />}
      {activeTab === 'faq' && <FAQTab />}
      {activeTab === 'testimonials' && <TestimonialsTab />}
      {activeTab === 'neighborhood' && <NeighborhoodTab />}
      {activeTab === 'site' && <SiteContentTab />}
    </div>
  );
}

/* ─── Blog Tab ─── */
function BlogTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { togglePublish, deletePost } = useBlogMutations();

  const fetchPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleToggle = async (id, current) => {
    await togglePublish(id, !current);
    fetchPosts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    await deletePost(id);
    fetchPosts();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-data text-sm text-text-muted">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        <Link to="/dashboard/content/blog/new" className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors">
          <Plus size={14} /> New Post
        </Link>
      </div>
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card divide-y divide-verde-50">
        {posts.map(post => (
          <div key={post.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body font-medium text-verde-800 truncate">{post.title}</span>
                {post.category && <span className="px-2 py-0.5 bg-verde-50 text-verde-600 font-data text-[10px] rounded-full uppercase">{post.category}</span>}
              </div>
              <div className="font-data text-xs text-text-muted mt-0.5">/{post.slug}</div>
            </div>
            <button onClick={() => handleToggle(post.id, post.is_published)} className={`p-1.5 rounded-lg transition-colors ${post.is_published ? 'text-verde-500 hover:bg-verde-50' : 'text-text-muted hover:bg-gray-100'}`} title={post.is_published ? 'Published' : 'Draft'}>
              {post.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <Link to={`/dashboard/content/blog/${post.id}`} className="p-1.5 rounded-lg text-verde-500 hover:bg-verde-50 transition-colors"><Pencil size={16} /></Link>
            <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
          </div>
        ))}
        {posts.length === 0 && <div className="p-8 text-center text-text-muted font-body">No blog posts yet.</div>}
      </div>
    </div>
  );
}

/* ─── FAQ Tab ─── */
function FAQTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', question: '', answer: '' });
  const { createFAQ, updateFAQ, deleteFAQ } = useContentMutations();

  const fetchItems = async () => {
    const { data } = await supabase.from('faq_items').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ category: item.category, question: item.question, answer: item.answer });
  };

  const startNew = () => {
    setEditing('new');
    setForm({ category: '', question: '', answer: '' });
  };

  const handleSave = async () => {
    if (editing === 'new') {
      await createFAQ({ ...form, sort_order: items.length });
    } else {
      await updateFAQ(editing, form);
    }
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ item?')) return;
    await deleteFAQ(id);
    fetchItems();
  };

  if (loading) return <Spinner />;

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-data text-sm text-text-muted">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors">
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      {editing && (
        <div className="bg-surface rounded-2xl border border-verde-200 shadow-card p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Question" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Answer" rows={3} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 mb-3" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-verde-500 text-cream-100 rounded-lg font-body text-sm font-semibold hover:bg-verde-600"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-text-secondary rounded-lg font-body text-sm hover:bg-gray-200"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} className="mb-4">
          <h3 className="font-heading font-bold text-verde-700 text-sm uppercase tracking-wider mb-2">{cat}</h3>
          <div className="bg-surface rounded-2xl border border-verde-100 shadow-card divide-y divide-verde-50">
            {items.filter(i => i.category === cat).map(item => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-body font-medium text-verde-800 text-sm">{item.question}</div>
                  <div className="font-body text-xs text-text-secondary mt-1 line-clamp-2">{item.answer}</div>
                </div>
                <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-verde-500 hover:bg-verde-50 shrink-0"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Testimonials Tab ─── */
function TestimonialsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', rating: 5, text: '', property: '' });
  const { createTestimonial, updateTestimonial, deleteTestimonial } = useContentMutations();

  const fetchItems = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ name: item.name, location: item.location || '', rating: item.rating, text: item.text, property: item.property || '' });
  };

  const startNew = () => {
    setEditing('new');
    setForm({ name: '', location: '', rating: 5, text: '', property: '' });
  };

  const handleSave = async () => {
    if (editing === 'new') {
      await createTestimonial({ ...form, sort_order: items.length, is_published: true });
    } else {
      await updateTestimonial(editing, form);
    }
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await deleteTestimonial(id);
    fetchItems();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-data text-sm text-text-muted">{items.length} testimonial{items.length !== 1 ? 's' : ''}</p>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors">
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {editing && (
        <div className="bg-surface rounded-2xl border border-verde-200 shadow-card p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Guest Name" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <input value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} placeholder="Property" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-body text-sm text-text-muted">Rating:</span>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))} className={`text-lg ${n <= form.rating ? 'text-gold-500' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Testimonial text..." rows={3} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 mb-3" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-verde-500 text-cream-100 rounded-lg font-body text-sm font-semibold hover:bg-verde-600"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-text-secondary rounded-lg font-body text-sm hover:bg-gray-200"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-surface rounded-2xl border border-verde-100 shadow-card p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-body font-medium text-verde-800">{item.name}</div>
                <div className="font-data text-xs text-text-muted">{item.location}{item.property && ` · ${item.property}`}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-verde-500 hover:bg-verde-50"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-gold-500 text-sm mb-2">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</div>
            <p className="font-body text-sm text-text-secondary line-clamp-3">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Neighborhood Tab ─── */
function NeighborhoodTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', distance: '', icon: 'MapPin', category: '' });
  const { createNeighborhood, updateNeighborhood, deleteNeighborhood } = useContentMutations();

  const fetchItems = async () => {
    const { data } = await supabase.from('neighborhood_highlights').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ name: item.name, description: item.description || '', distance: item.distance || '', icon: item.icon || 'MapPin', category: item.category || '' });
  };

  const startNew = () => {
    setEditing('new');
    setForm({ name: '', description: '', distance: '', icon: 'MapPin', category: '' });
  };

  const handleSave = async () => {
    if (editing === 'new') {
      await createNeighborhood({ ...form, sort_order: items.length });
    } else {
      await updateNeighborhood(editing, form);
    }
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this neighborhood item?')) return;
    await deleteNeighborhood(id);
    fetchItems();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-data text-sm text-text-muted">{items.length} highlight{items.length !== 1 ? 's' : ''}</p>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors">
          <Plus size={14} /> Add Highlight
        </button>
      </div>

      {editing && (
        <div className="bg-surface rounded-2xl border border-verde-200 shadow-card p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <input value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} placeholder="Distance (e.g. 0.3 miles)" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Icon name" className="px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 mb-3" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-verde-500 text-cream-100 rounded-lg font-body text-sm font-semibold hover:bg-verde-600"><Save size={14} /> Save</button>
            <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-text-secondary rounded-lg font-body text-sm hover:bg-gray-200"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card divide-y divide-verde-50">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 px-5 py-3">
            <MapPin size={16} className="text-verde-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body font-medium text-verde-800 text-sm">{item.name}</span>
                {item.category && <span className="px-2 py-0.5 bg-verde-50 text-verde-600 font-data text-[10px] rounded-full uppercase">{item.category}</span>}
              </div>
              <div className="font-body text-xs text-text-secondary">{item.description}</div>
            </div>
            <span className="font-data text-xs text-text-muted shrink-0">{item.distance}</span>
            <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-verde-500 hover:bg-verde-50 shrink-0"><Pencil size={14} /></button>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 shrink-0"><Trash2 size={14} /></button>
          </div>
        ))}
        {items.length === 0 && <div className="p-8 text-center text-text-muted font-body">No neighborhood highlights yet.</div>}
      </div>
    </div>
  );
}

/* ─── Site Content Tab ─── */
function SiteContentTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const { updateSiteContent } = useContentMutations();

  const fetchEntries = async () => {
    const { data } = await supabase.from('site_content').select('*').order('key');
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const startEdit = (entry) => {
    setEditing(entry.key);
    setEditValue(JSON.stringify(entry.value, null, 2));
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(editValue);
      await updateSiteContent(editing, parsed);
      setEditing(null);
      fetchEntries();
    } catch {
      alert('Invalid JSON. Please check the format.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <p className="font-data text-sm text-text-muted mb-4">{entries.length} content block{entries.length !== 1 ? 's' : ''}</p>
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.key} className="bg-surface rounded-2xl border border-verde-100 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-verde-800 capitalize">{entry.key.replace(/_/g, ' ')}</h3>
              {editing === entry.key ? (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-verde-500 text-cream-100 rounded-lg font-body text-xs font-semibold hover:bg-verde-600"><Save size={12} /> Save</button>
                  <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-text-secondary rounded-lg font-body text-xs hover:bg-gray-200"><X size={12} /> Cancel</button>
                </div>
              ) : (
                <button onClick={() => startEdit(entry)} className="p-1.5 rounded-lg text-verde-500 hover:bg-verde-50"><Pencil size={14} /></button>
              )}
            </div>
            {editing === entry.key ? (
              <textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={12} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-verde-400" />
            ) : (
              <pre className="font-mono text-xs text-text-secondary bg-cream-50 rounded-lg p-3 overflow-auto max-h-40">{JSON.stringify(entry.value, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared ─── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-verde-500 border-t-transparent" />
    </div>
  );
}
