import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, DollarSign, Moon, StickyNote, Trash2 } from 'lucide-react';

export default function CalendarPricingPanel({ selectedDates, pricingData, basePrice, onSave, onClear, onClose }) {
  const [customPrice, setCustomPrice] = useState('');
  const [minimumStay, setMinimumStay] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isSingle = selectedDates.length === 1;
  const existingPricing = isSingle
    ? pricingData.find(p => p.date === format(selectedDates[0], 'yyyy-MM-dd'))
    : null;

  useEffect(() => {
    if (existingPricing) {
      setCustomPrice(existingPricing.custom_price ? (existingPricing.custom_price / 100).toString() : '');
      setMinimumStay(existingPricing.minimum_stay?.toString() || '');
      setNotes(existingPricing.notes || '');
    } else {
      setCustomPrice('');
      setMinimumStay('');
      setNotes('');
    }
  }, [existingPricing]);

  const handleSave = async () => {
    setSaving(true);
    const data = {};
    if (customPrice) data.custom_price = Math.round(parseFloat(customPrice) * 100);
    else data.custom_price = null;
    if (minimumStay) data.minimum_stay = parseInt(minimumStay);
    else data.minimum_stay = null;
    data.notes = notes || null;

    await onSave(selectedDates.map(d => format(d, 'yyyy-MM-dd')), data);
    setSaving(false);
  };

  const handleClear = async () => {
    setSaving(true);
    await onClear(selectedDates.map(d => format(d, 'yyyy-MM-dd')));
    setSaving(false);
  };

  const dateLabel = isSingle
    ? format(selectedDates[0], 'EEEE, MMM d, yyyy')
    : `${format(selectedDates[0], 'MMM d')} — ${format(selectedDates[selectedDates.length - 1], 'MMM d')} (${selectedDates.length} nights)`;

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-elevated p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-verde-800">Edit Pricing</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-verde-50 text-text-muted"><X size={18} /></button>
      </div>

      <p className="font-body text-sm text-verde-600 font-medium mb-4">{dateLabel}</p>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">
            <DollarSign size={12} /> Nightly Rate
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-body text-sm">$</span>
            <input
              type="number"
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              placeholder={basePrice ? (basePrice / 100).toFixed(0) : 'Default'}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            />
          </div>
          {basePrice && (
            <p className="font-data text-[10px] text-text-muted mt-1">Base rate: ${(basePrice / 100).toFixed(0)}/night</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">
            <Moon size={12} /> Minimum Stay
          </label>
          <input
            type="number"
            value={minimumStay}
            onChange={e => setMinimumStay(e.target.value)}
            placeholder="Use global setting"
            min="1"
            className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">
            <StickyNote size={12} /> Notes
          </label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g., Holiday weekend, Special event"
            className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Apply'}
          </button>
          {existingPricing && (
            <button
              onClick={handleClear}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-xl font-body text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
