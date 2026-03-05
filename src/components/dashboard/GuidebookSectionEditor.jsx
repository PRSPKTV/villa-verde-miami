import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react';

function WifiEditor({ content, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
          Network Name
        </label>
        <input
          type="text"
          value={content.network_name || ''}
          onChange={(e) => onChange({ ...content, network_name: e.target.value })}
          placeholder="e.g. VillaVerde-Guest"
          className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
        />
      </div>
      <div>
        <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
          Password
        </label>
        <input
          type="text"
          value={content.password || ''}
          onChange={(e) => onChange({ ...content, password: e.target.value })}
          placeholder="WiFi password"
          className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
        />
      </div>
    </div>
  );
}

function AppliancesEditor({ content, onChange }) {
  const items = content.appliances || [];

  const addItem = () => {
    onChange({ ...content, appliances: [...items, { name: '', instructions: '' }] });
  };

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, appliances: updated });
  };

  const removeItem = (index) => {
    onChange({ ...content, appliances: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="Appliance name"
              className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <textarea
              value={item.instructions}
              onChange={(e) => updateItem(index, 'instructions', e.target.value)}
              placeholder="Usage instructions"
              rows={2}
              className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300 resize-none"
            />
          </div>
          <button
            onClick={() => removeItem(index)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Appliance
      </button>
    </div>
  );
}

function EmergencyEditor({ content, onChange }) {
  const contacts = content.contacts || [];

  const addContact = () => {
    onChange({
      ...content,
      contacts: [...contacts, { name: '', phone: '', description: '' }],
    });
  };

  const updateContact = (index, field, value) => {
    const updated = contacts.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    onChange({ ...content, contacts: updated });
  };

  const removeContact = (index) => {
    onChange({ ...content, contacts: contacts.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {contacts.map((contact, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={contact.name}
              onChange={(e) => updateContact(index, 'name', e.target.value)}
              placeholder="Contact name"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <input
              type="text"
              value={contact.phone}
              onChange={(e) => updateContact(index, 'phone', e.target.value)}
              placeholder="Phone number"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <input
              type="text"
              value={contact.description}
              onChange={(e) => updateContact(index, 'description', e.target.value)}
              placeholder="Role / description"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
          </div>
          <button
            onClick={() => removeContact(index)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addContact}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Contact
      </button>
    </div>
  );
}

function LocalRecsEditor({ content, onChange }) {
  const places = content.places || [];

  const addPlace = () => {
    onChange({
      ...content,
      places: [...places, { name: '', category: '', description: '', distance: '' }],
    });
  };

  const updatePlace = (index, field, value) => {
    const updated = places.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange({ ...content, places: updated });
  };

  const removePlace = (index) => {
    onChange({ ...content, places: places.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {places.map((place, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={place.name}
              onChange={(e) => updatePlace(index, 'name', e.target.value)}
              placeholder="Place name"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <input
              type="text"
              value={place.category}
              onChange={(e) => updatePlace(index, 'category', e.target.value)}
              placeholder="Category (restaurant, bar, etc.)"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <input
              type="text"
              value={place.description}
              onChange={(e) => updatePlace(index, 'description', e.target.value)}
              placeholder="Description"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <input
              type="text"
              value={place.distance}
              onChange={(e) => updatePlace(index, 'distance', e.target.value)}
              placeholder="Distance (e.g. 0.3 mi)"
              className="px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
          </div>
          <button
            onClick={() => removePlace(index)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addPlace}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Place
      </button>
    </div>
  );
}

function TextareaEditor({ content, onChange, placeholder }) {
  return (
    <textarea
      value={content.text || ''}
      onChange={(e) => onChange({ ...content, text: e.target.value })}
      placeholder={placeholder}
      rows={5}
      className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300 resize-none"
    />
  );
}

function HouseRulesEditor({ content, onChange }) {
  const rules = content.rules || [];

  const addRule = () => {
    onChange({ ...content, rules: [...rules, ''] });
  };

  const updateRule = (index, value) => {
    const updated = rules.map((r, i) => (i === index ? value : r));
    onChange({ ...content, rules: updated });
  };

  const removeRule = (index) => {
    onChange({ ...content, rules: rules.filter((_, i) => i !== index) });
  };

  const moveRule = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= rules.length) return;
    const updated = [...rules];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange({ ...content, rules: updated });
  };

  return (
    <div className="space-y-2">
      {rules.map((rule, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveRule(index, -1)}
              disabled={index === 0}
              className="p-0.5 text-verde-400 hover:text-verde-600 disabled:opacity-30 transition-colors"
            >
              <GripVertical className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs font-data text-verde-400 w-5 text-right shrink-0">
            {index + 1}.
          </span>
          <input
            type="text"
            value={rule}
            onChange={(e) => updateRule(index, e.target.value)}
            placeholder="House rule"
            className="flex-1 px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
          />
          <button
            onClick={() => removeRule(index)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addRule}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Rule
      </button>
    </div>
  );
}

function StepsEditor({ content, onChange, label }) {
  const steps = content.steps || [];

  const addStep = () => {
    onChange({ ...content, steps: [...steps, { text: '', image_url: '' }] });
  };

  const updateStep = (index, field, value) => {
    const updated = steps.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange({ ...content, steps: updated });
  };

  const removeStep = (index) => {
    onChange({ ...content, steps: steps.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-2 items-start">
          <span className="flex items-center justify-center w-7 h-7 bg-verde-100 text-verde-700 rounded-full text-xs font-heading font-bold shrink-0 mt-1">
            {index + 1}
          </span>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={step.text}
              onChange={(e) => updateStep(index, 'text', e.target.value)}
              placeholder={`${label} step ${index + 1}`}
              className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
            <input
              type="url"
              value={step.image_url || ''}
              onChange={(e) => updateStep(index, 'image_url', e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
            />
          </div>
          <button
            onClick={() => removeStep(index)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addStep}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Step
      </button>
    </div>
  );
}

export default function GuidebookSectionEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section?.content || {});
  const [title, setTitle] = useState(section?.title || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ title, content });
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    switch (section?.section_type) {
      case 'wifi':
        return <WifiEditor content={content} onChange={setContent} />;
      case 'appliances':
        return <AppliancesEditor content={content} onChange={setContent} />;
      case 'emergency':
        return <EmergencyEditor content={content} onChange={setContent} />;
      case 'local_recs':
        return <LocalRecsEditor content={content} onChange={setContent} />;
      case 'transportation':
        return (
          <TextareaEditor
            content={content}
            onChange={setContent}
            placeholder="Public transit info, ride-share tips, bike rentals, etc."
          />
        );
      case 'house_rules':
        return <HouseRulesEditor content={content} onChange={setContent} />;
      case 'checkin':
        return <StepsEditor content={content} onChange={setContent} label="Check-in" />;
      case 'checkout':
        return <StepsEditor content={content} onChange={setContent} label="Checkout" />;
      case 'parking':
        return (
          <TextareaEditor
            content={content}
            onChange={setContent}
            placeholder="Parking instructions, garage codes, street parking rules, etc."
          />
        );
      case 'custom':
      default:
        return (
          <TextareaEditor
            content={content}
            onChange={setContent}
            placeholder="Enter custom guidebook content..."
          />
        );
    }
  };

  return (
    <div className="bg-cream-50 rounded-xl border border-verde-200 p-5 space-y-4">
      <div>
        <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Section title"
          className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
        />
      </div>

      <div>
        <label className="block text-sm font-heading font-medium text-verde-700 mb-2">
          Content
        </label>
        {renderEditor()}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-verde-100">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-heading font-medium bg-verde-600 text-white rounded-xl hover:bg-verde-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
