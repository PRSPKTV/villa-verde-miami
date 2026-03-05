import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Edit3, X, Check } from 'lucide-react';

const RULE_TYPES = [
  { value: 'weekend', label: 'Weekend' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'last_minute', label: 'Last Minute' },
  { value: 'custom', label: 'Custom' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PricingRulesManager({ rules, onCreate, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', rule_type: 'weekend', adjustment_type: 'percent', adjustment_value: '',
    start_date: '', end_date: '', days_of_week: [5, 6], priority: 0,
  });

  const resetForm = () => {
    setForm({ name: '', rule_type: 'weekend', adjustment_type: 'percent', adjustment_value: '', start_date: '', end_date: '', days_of_week: [5, 6], priority: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (rule) => {
    setForm({
      name: rule.name, rule_type: rule.rule_type, adjustment_type: rule.adjustment_type,
      adjustment_value: rule.adjustment_value.toString(),
      start_date: rule.start_date || '', end_date: rule.end_date || '',
      days_of_week: rule.days_of_week || [], priority: rule.priority || 0,
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      adjustment_value: parseFloat(form.adjustment_value),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      days_of_week: form.days_of_week.length > 0 ? form.days_of_week : null,
    };
    if (editingId) await onUpdate(editingId, data);
    else await onCreate(data);
    resetForm();
  };

  const toggleDay = (dayIdx) => {
    setForm(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayIdx)
        ? prev.days_of_week.filter(d => d !== dayIdx)
        : [...prev.days_of_week, dayIdx].sort(),
    }));
  };

  const toggleActive = async (rule) => {
    await onUpdate(rule.id, { is_active: !rule.is_active });
  };

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-verde-800">Pricing Rules</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-verde-500 text-cream-100 rounded-lg font-body text-xs font-semibold hover:bg-verde-600">
            <Plus size={14} /> Add Rule
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-cream-50 rounded-xl p-4 mb-4 border border-verde-100">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Weekend Premium" className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            </div>
            <div>
              <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Type</label>
              <select value={form.rule_type} onChange={e => setForm(p => ({ ...p, rule_type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400">
                {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Adjustment</label>
              <select value={form.adjustment_type} onChange={e => setForm(p => ({ ...p, adjustment_type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400">
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Value</label>
              <input type="number" value={form.adjustment_value} onChange={e => setForm(p => ({ ...p, adjustment_value: e.target.value }))} placeholder={form.adjustment_type === 'percent' ? '10 for +10%' : '50 for +$50'} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
            </div>
          </div>

          {(form.rule_type === 'seasonal' || form.rule_type === 'custom') && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
              </div>
              <div>
                <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1 block">End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400" />
              </div>
            </div>
          )}

          {(form.rule_type === 'weekend' || form.rule_type === 'custom') && (
            <div className="mb-3">
              <label className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-2 block">Days of Week</label>
              <div className="flex gap-1">
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => toggleDay(i)} className={`px-2.5 py-1 rounded-lg font-data text-xs font-semibold transition-colors ${form.days_of_week.includes(i) ? 'bg-verde-500 text-cream-100' : 'bg-verde-50 text-verde-600 hover:bg-verde-100'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={!form.name || !form.adjustment_value} className="flex items-center gap-1 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 disabled:opacity-50">
              <Check size={14} /> {editingId ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="flex items-center gap-1 px-4 py-2 bg-cream-50 text-verde-700 rounded-xl font-body text-sm hover:bg-verde-50 border border-verde-200">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {rules.length === 0 && !showForm && (
        <p className="font-body text-sm text-text-muted py-4 text-center">No pricing rules yet. Add rules for weekend premiums, seasonal rates, or custom adjustments.</p>
      )}

      <div className="space-y-2">
        {rules.map(rule => (
          <div key={rule.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${rule.is_active ? 'border-verde-200 bg-white' : 'border-verde-100 bg-cream-50 opacity-60'}`}>
            <button onClick={() => toggleActive(rule)} className="shrink-0">
              {rule.is_active ? <ToggleRight size={22} className="text-verde-500" /> : <ToggleLeft size={22} className="text-text-muted" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-body text-sm font-semibold text-verde-800 truncate">{rule.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-verde-50 text-verde-600 font-data text-[10px] uppercase">{rule.rule_type}</span>
              </div>
              <span className="font-data text-xs text-text-muted">
                {rule.adjustment_value > 0 ? '+' : ''}{rule.adjustment_value}{rule.adjustment_type === 'percent' ? '%' : '$'}
                {rule.start_date && ` · ${rule.start_date} → ${rule.end_date}`}
                {rule.days_of_week && ` · ${rule.days_of_week.map(d => DAYS[d]).join(', ')}`}
              </span>
            </div>
            <button onClick={() => startEdit(rule)} className="p-1.5 rounded-lg hover:bg-verde-50 text-verde-600"><Edit3 size={14} /></button>
            <button onClick={() => onDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
