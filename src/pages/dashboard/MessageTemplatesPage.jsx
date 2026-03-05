import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMessageMutations } from '@/hooks/useMessageMutations';
import { useProperties } from '@/hooks/useProperties';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit3, ToggleLeft, ToggleRight, Eye, X, Check, Mail } from 'lucide-react';

const TRIGGER_TYPES = [
  { value: 'booking_confirmed', label: 'Booking Confirmed', desc: 'Sent when a new booking is confirmed' },
  { value: 'pre_checkin', label: 'Before Check-in', desc: 'Sent X hours before check-in' },
  { value: 'checkin_day', label: 'Check-in Day', desc: 'Sent on the day of check-in' },
  { value: 'checkout_day', label: 'Checkout Day', desc: 'Sent on the day of checkout' },
  { value: 'post_checkout', label: 'After Checkout', desc: 'Sent X hours after checkout' },
  { value: 'manual', label: 'Manual', desc: 'Only sent when manually triggered' },
];

const SHORTCODES = [
  '{guest_name}', '{check_in_date}', '{check_out_date}', '{property_name}',
  '{confirmation_code}', '{door_code}', '{wifi_name}', '{wifi_password}',
];

export default function MessageTemplatesPage() {
  const { properties } = useProperties();
  const { createTemplate, updateTemplate, deleteTemplate, toggleTemplate } = useMessageMutations();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  const [form, setForm] = useState({
    name: '', trigger_type: 'booking_confirmed', trigger_offset_hours: 0,
    subject: '', body: '', property_slug: '', is_active: true,
  });

  const fetchTemplates = async () => {
    const { data } = await supabase.from('message_templates').select('*').order('created_at', { ascending: true });
    setTemplates(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const resetForm = () => {
    setForm({ name: '', trigger_type: 'booking_confirmed', trigger_offset_hours: 0, subject: '', body: '', property_slug: '', is_active: true });
    setEditing(null);
  };

  const startEdit = (tpl) => {
    setForm({
      name: tpl.name, trigger_type: tpl.trigger_type, trigger_offset_hours: tpl.trigger_offset_hours || 0,
      subject: tpl.subject, body: tpl.body, property_slug: tpl.property_slug || '', is_active: tpl.is_active,
    });
    setEditing(tpl.id);
  };

  const handleSave = async () => {
    const data = { ...form, property_slug: form.property_slug || null };
    if (editing) {
      await updateTemplate(editing, data);
    } else {
      await createTemplate(data);
    }
    resetForm();
    fetchTemplates();
  };

  const handleDelete = async (id) => {
    await deleteTemplate(id);
    fetchTemplates();
  };

  const handleToggle = async (tpl) => {
    await toggleTemplate(tpl.id, !tpl.is_active);
    fetchTemplates();
  };

  const renderPreview = (body) => {
    const sample = {
      '{guest_name}': 'John Smith',
      '{check_in_date}': 'March 15, 2026',
      '{check_out_date}': 'March 20, 2026',
      '{property_name}': 'Villa Verde Tropical Escape',
      '{confirmation_code}': 'VV-ABC123',
      '{door_code}': '1234#',
      '{wifi_name}': 'VillaVerde-Guest',
      '{wifi_password}': 'welcome2026',
    };
    let rendered = body;
    Object.entries(sample).forEach(([k, v]) => { rendered = rendered.replaceAll(k, v); });
    return rendered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard/messages" className="p-2 rounded-lg hover:bg-verde-50 text-verde-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-heading text-3xl font-bold text-verde-800">Message Templates</h1>
          <p className="text-text-secondary font-body mt-1">Automate guest communication with triggered email templates.</p>
        </div>
      </div>

      {/* Template Form */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6 mb-6">
        <h2 className="font-heading text-lg font-bold text-verde-800 mb-4">{editing ? 'Edit Template' : 'Create Template'}</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Template Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Welcome Message" className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
          </div>
          <div>
            <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Trigger</label>
            <select value={form.trigger_type} onChange={e => setForm(p => ({ ...p, trigger_type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400">
              {TRIGGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Offset (hours)</label>
            <input type="number" value={form.trigger_offset_hours} onChange={e => setForm(p => ({ ...p, trigger_offset_hours: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            <p className="font-data text-[10px] text-text-muted mt-1">Negative = before trigger, Positive = after</p>
          </div>
          <div>
            <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Property (optional)</label>
            <select value={form.property_slug} onChange={e => setForm(p => ({ ...p, property_slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400">
              <option value="">All Properties (Global)</option>
              {properties.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Subject Line</label>
          <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Welcome to {property_name}!" className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
        </div>

        <div className="mb-3">
          <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Message Body</label>
          <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={6} placeholder="Hi {guest_name}, welcome to your stay at {property_name}..." className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 resize-y" />
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <span className="font-data text-[10px] text-text-muted mr-1 self-center">Shortcodes:</span>
          {SHORTCODES.map(sc => (
            <button key={sc} onClick={() => setForm(p => ({ ...p, body: p.body + sc }))} className="px-2 py-0.5 rounded bg-verde-50 text-verde-600 font-data text-[10px] hover:bg-verde-100 border border-verde-100">
              {sc}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={!form.name || !form.subject || !form.body} className="flex items-center gap-1 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 disabled:opacity-50">
            <Check size={14} /> {editing ? 'Update' : 'Create'} Template
          </button>
          {editing && (
            <button onClick={resetForm} className="flex items-center gap-1 px-4 py-2 bg-cream-50 text-verde-700 rounded-xl font-body text-sm hover:bg-verde-50 border border-verde-200">
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {templates.length === 0 && (
          <div className="bg-surface rounded-2xl border border-verde-100 p-8 text-center">
            <Mail size={32} className="mx-auto text-verde-200 mb-3" />
            <p className="font-body text-sm text-text-muted">No templates yet. Create your first automated message above.</p>
          </div>
        )}

        {templates.map(tpl => {
          const trigger = TRIGGER_TYPES.find(t => t.value === tpl.trigger_type);
          return (
            <div key={tpl.id} className={`bg-surface rounded-2xl border p-4 transition-colors ${tpl.is_active ? 'border-verde-200' : 'border-verde-100 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body text-sm font-bold text-verde-800">{tpl.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-verde-50 text-verde-600 font-data text-[10px]">{trigger?.label}</span>
                    {tpl.trigger_offset_hours !== 0 && (
                      <span className="font-data text-[10px] text-text-muted">{tpl.trigger_offset_hours > 0 ? '+' : ''}{tpl.trigger_offset_hours}h</span>
                    )}
                    {tpl.property_slug && (
                      <span className="px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-data text-[10px]">{tpl.property_slug}</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-text-muted truncate">Subject: {tpl.subject}</p>
                  <p className="font-body text-xs text-text-muted truncate mt-0.5">{tpl.body.substring(0, 100)}...</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button onClick={() => setShowPreview(showPreview === tpl.id ? null : tpl.id)} className="p-1.5 rounded-lg hover:bg-verde-50 text-verde-600" title="Preview"><Eye size={14} /></button>
                  <button onClick={() => startEdit(tpl)} className="p-1.5 rounded-lg hover:bg-verde-50 text-verde-600" title="Edit"><Edit3 size={14} /></button>
                  <button onClick={() => handleToggle(tpl)} className="p-1.5 rounded-lg hover:bg-verde-50" title="Toggle">
                    {tpl.is_active ? <ToggleRight size={18} className="text-verde-500" /> : <ToggleLeft size={18} className="text-text-muted" />}
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>

              {showPreview === tpl.id && (
                <div className="mt-3 pt-3 border-t border-verde-100">
                  <p className="font-data text-[10px] uppercase text-text-muted mb-1">Preview (with sample data)</p>
                  <div className="bg-cream-50 rounded-lg p-3 border border-verde-100">
                    <p className="font-body text-sm font-semibold text-verde-800 mb-1">{renderPreview(tpl.subject)}</p>
                    <p className="font-body text-sm text-verde-700 whitespace-pre-wrap">{renderPreview(tpl.body)}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
