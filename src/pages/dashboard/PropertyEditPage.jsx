import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { usePropertyMutations } from '@/hooks/usePropertyMutations';
import { amenityMap } from '@/data/amenities';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

/* ──────────────────────────── helpers ──────────────────────────── */

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const PROPERTY_TYPES = ['Entire Home', 'Guesthouse', 'Guest Suite', 'Entire Apartment'];
const AMENITY_KEYS = Object.keys(amenityMap);

const SECTION_IDS = [
  'basic',
  'location',
  'pricing',
  'details',
  'amenities',
  'house-rules',
  'images',
  'checkin',
  'host',
  'rating',
  'ical',
  'publish',
];

const SECTION_LABELS = {
  basic: 'Basic Info',
  location: 'Location',
  pricing: 'Pricing',
  details: 'Details',
  amenities: 'Amenities',
  'house-rules': 'House Rules',
  images: 'Images',
  checkin: 'Check-in Info',
  host: 'Host',
  rating: 'Rating',
  ical: 'iCal Sync',
  publish: 'Publishing',
};

const emptyForm = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  location: { address: '', neighborhood: '', city: '', state: '', zip: '' },
  pricing: { nightlyRate: '', cleaningFee: '', serviceFeeRate: '', taxRate: '', minimumStay: '' },
  details: { propertyType: 'Entire Home', maxGuests: '', bedrooms: '', beds: '', bathrooms: '' },
  amenities: [],
  house_rules: [''],
  images: [{ url: '', alt: '' }],
  checkin: {
    doorCodeFormat: '',
    instructions: '',
    wifiName: '',
    wifiPassword: '',
    parkingInstructions: '',
    additionalNotes: '',
  },
  host: { name: '', isSuperhost: false, responseTime: '' },
  rating: { average: '', count: '' },
  airbnb_ical_url: '',
  is_published: false,
};

/* ──────────────────────────── component ──────────────────────────── */

export default function PropertyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { createProperty, updateProperty } = usePropertyMutations();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  /* ── fetch existing property ── */
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const { data, error: fetchErr } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr) {
        setError('Property not found.');
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || '',
        slug: data.slug || '',
        tagline: data.tagline || '',
        description: data.description || '',
        location: { ...emptyForm.location, ...(data.location || {}) },
        pricing: { ...emptyForm.pricing, ...(data.pricing || {}) },
        details: { ...emptyForm.details, ...(data.details || {}) },
        amenities: data.amenities || [],
        house_rules:
          data.house_rules && data.house_rules.length > 0 ? data.house_rules : [''],
        images:
          data.images && data.images.length > 0 ? data.images : [{ url: '', alt: '' }],
        checkin: { ...emptyForm.checkin, ...(data.checkin || {}) },
        host: { ...emptyForm.host, ...(data.host || {}) },
        rating: {
          average: data.rating?.average ?? '',
          count: data.rating?.count ?? '',
        },
        airbnb_ical_url: data.airbnb_ical_url || '',
        is_published: data.is_published || false,
      });
      setSlugManuallyEdited(true);
      setLoading(false);
    })();
  }, [id, isEditing]);

  /* ── auto-slug ── */
  useEffect(() => {
    if (!slugManuallyEdited && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [form.name, slugManuallyEdited]);

  /* ── generic field updaters ── */
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const setNested = (group, field, value) =>
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } }));

  /* ── amenity toggle ── */
  const toggleAmenity = (key) => {
    setForm((prev) => {
      const has = prev.amenities.includes(key);
      return {
        ...prev,
        amenities: has
          ? prev.amenities.filter((a) => a !== key)
          : [...prev.amenities, key],
      };
    });
  };

  /* ── house rules ── */
  const setRule = (index, value) =>
    setForm((prev) => {
      const rules = [...prev.house_rules];
      rules[index] = value;
      return { ...prev, house_rules: rules };
    });

  const addRule = () => setForm((prev) => ({ ...prev, house_rules: [...prev.house_rules, ''] }));

  const removeRule = (index) =>
    setForm((prev) => ({
      ...prev,
      house_rules: prev.house_rules.filter((_, i) => i !== index),
    }));

  /* ── images ── */
  const setImage = (index, field, value) =>
    setForm((prev) => {
      const imgs = [...prev.images];
      imgs[index] = { ...imgs[index], [field]: value };
      return { ...prev, images: imgs };
    });

  const addImage = () =>
    setForm((prev) => ({ ...prev, images: [...prev.images, { url: '', alt: '' }] }));

  const removeImage = (index) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

  const moveImage = (from, to) => {
    if (to < 0 || to >= form.images.length) return;
    setForm((prev) => {
      const imgs = [...prev.images];
      const [moved] = imgs.splice(from, 1);
      imgs.splice(to, 0, moved);
      return { ...prev, images: imgs };
    });
  };

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      /* Clean house rules — remove empty strings */
      const cleanRules = form.house_rules.filter((r) => r.trim() !== '');

      /* Clean images — remove entries with no URL */
      const cleanImages = form.images.filter((img) => img.url.trim() !== '');

      /* Clean pricing — coerce numbers */
      const pricing = {
        nightlyRate: form.pricing.nightlyRate ? Number(form.pricing.nightlyRate) : null,
        cleaningFee: form.pricing.cleaningFee ? Number(form.pricing.cleaningFee) : null,
        serviceFeeRate: form.pricing.serviceFeeRate ? Number(form.pricing.serviceFeeRate) : null,
        taxRate: form.pricing.taxRate ? Number(form.pricing.taxRate) : null,
        minimumStay: form.pricing.minimumStay ? Number(form.pricing.minimumStay) : null,
      };

      /* Clean details — coerce numbers */
      const details = {
        propertyType: form.details.propertyType,
        maxGuests: form.details.maxGuests ? Number(form.details.maxGuests) : null,
        bedrooms: form.details.bedrooms ? Number(form.details.bedrooms) : null,
        beds: form.details.beds ? Number(form.details.beds) : null,
        bathrooms: form.details.bathrooms ? Number(form.details.bathrooms) : null,
      };

      /* Clean rating — coerce numbers */
      const rating = {
        average: form.rating.average ? Number(form.rating.average) : null,
        count: form.rating.count ? Number(form.rating.count) : null,
      };

      const payload = {
        name: form.name,
        slug: form.slug,
        tagline: form.tagline,
        description: form.description,
        location: form.location,
        pricing,
        details,
        amenities: form.amenities,
        house_rules: cleanRules,
        images: cleanImages,
        checkin: form.checkin,
        host: form.host,
        rating,
        airbnb_ical_url: form.airbnb_ical_url || null,
        is_published: form.is_published,
      };

      if (isEditing) {
        await updateProperty(id, payload);
      } else {
        await createProperty(payload);
      }

      navigate('/dashboard/properties');
    } catch (err) {
      setError(err.message || 'Failed to save property.');
      setSaving(false);
    }
  };

  /* ──────────────────────────── render ──────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/properties')}
            className="p-2 rounded-lg text-verde-600 hover:bg-verde-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-bold text-verde-800">
              {isEditing ? 'Edit Property' : 'New Property'}
            </h1>
            <p className="text-text-secondary font-body mt-1">
              {isEditing
                ? 'Update listing details, pricing, and images.'
                : 'Add a new property to your portfolio.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 font-body font-semibold px-5 py-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-transform shadow-tropical disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-verde-800 border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Property
            </>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="font-body text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Layout: sidebar nav + form */}
      <div className="flex gap-6">
        {/* Section Nav */}
        <nav className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-8 space-y-1">
            {SECTION_IDS.map((sectionId) => (
              <button
                key={sectionId}
                onClick={() => {
                  setActiveSection(sectionId);
                  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                  activeSection === sectionId
                    ? 'bg-verde-100 text-verde-700 font-semibold'
                    : 'text-text-muted hover:bg-verde-50 hover:text-verde-600'
                }`}
              >
                {SECTION_LABELS[sectionId]}
              </button>
            ))}
          </div>
        </nav>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 min-w-0 space-y-6">
          {/* ── Basic Info ── */}
          <FormSection id="basic" title="Basic Info" activeSection={activeSection} onOpen={setActiveSection}>
            <Field label="Property Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Villa Verde — Wynwood Retreat"
                className="form-input"
                required
              />
            </Field>
            <Field label="Slug" hint="URL-friendly identifier. Auto-generated from name.">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  set('slug', e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="villa-verde-wynwood-retreat"
                className="form-input font-data text-sm"
              />
            </Field>
            <Field label="Tagline">
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="A short, catchy headline"
                className="form-input"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={5}
                placeholder="Detailed description of the property..."
                className="form-input resize-y"
              />
            </Field>
          </FormSection>

          {/* ── Location ── */}
          <FormSection id="location" title="Location" activeSection={activeSection} onOpen={setActiveSection}>
            <Field label="Address">
              <input
                type="text"
                value={form.location.address}
                onChange={(e) => setNested('location', 'address', e.target.value)}
                placeholder="123 NW 24th St"
                className="form-input"
              />
            </Field>
            <Field label="Neighborhood">
              <input
                type="text"
                value={form.location.neighborhood}
                onChange={(e) => setNested('location', 'neighborhood', e.target.value)}
                placeholder="Wynwood"
                className="form-input"
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City">
                <input
                  type="text"
                  value={form.location.city}
                  onChange={(e) => setNested('location', 'city', e.target.value)}
                  placeholder="Miami"
                  className="form-input"
                />
              </Field>
              <Field label="State">
                <input
                  type="text"
                  value={form.location.state}
                  onChange={(e) => setNested('location', 'state', e.target.value)}
                  placeholder="FL"
                  className="form-input"
                />
              </Field>
              <Field label="ZIP">
                <input
                  type="text"
                  value={form.location.zip}
                  onChange={(e) => setNested('location', 'zip', e.target.value)}
                  placeholder="33127"
                  className="form-input"
                />
              </Field>
            </div>
          </FormSection>

          {/* ── Pricing ── */}
          <FormSection id="pricing" title="Pricing" activeSection={activeSection} onOpen={setActiveSection}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nightly Rate ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.pricing.nightlyRate}
                  onChange={(e) => setNested('pricing', 'nightlyRate', e.target.value)}
                  placeholder="250"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Cleaning Fee ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.pricing.cleaningFee}
                  onChange={(e) => setNested('pricing', 'cleaningFee', e.target.value)}
                  placeholder="150"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Service Fee Rate" hint="Decimal (e.g. 0.12 for 12%)">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={form.pricing.serviceFeeRate}
                  onChange={(e) => setNested('pricing', 'serviceFeeRate', e.target.value)}
                  placeholder="0.12"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Tax Rate" hint="Decimal (e.g. 0.13 for 13%)">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={form.pricing.taxRate}
                  onChange={(e) => setNested('pricing', 'taxRate', e.target.value)}
                  placeholder="0.13"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Minimum Stay (nights)">
                <input
                  type="number"
                  min="1"
                  value={form.pricing.minimumStay}
                  onChange={(e) => setNested('pricing', 'minimumStay', e.target.value)}
                  placeholder="2"
                  className="form-input font-data"
                />
              </Field>
            </div>
          </FormSection>

          {/* ── Details ── */}
          <FormSection id="details" title="Details" activeSection={activeSection} onOpen={setActiveSection}>
            <Field label="Property Type">
              <select
                value={form.details.propertyType}
                onChange={(e) => setNested('details', 'propertyType', e.target.value)}
                className="form-input"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Max Guests">
                <input
                  type="number"
                  min="1"
                  value={form.details.maxGuests}
                  onChange={(e) => setNested('details', 'maxGuests', e.target.value)}
                  placeholder="6"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Bedrooms">
                <input
                  type="number"
                  min="0"
                  value={form.details.bedrooms}
                  onChange={(e) => setNested('details', 'bedrooms', e.target.value)}
                  placeholder="3"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Beds">
                <input
                  type="number"
                  min="0"
                  value={form.details.beds}
                  onChange={(e) => setNested('details', 'beds', e.target.value)}
                  placeholder="4"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Bathrooms">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.details.bathrooms}
                  onChange={(e) => setNested('details', 'bathrooms', e.target.value)}
                  placeholder="2"
                  className="form-input font-data"
                />
              </Field>
            </div>
          </FormSection>

          {/* ── Amenities ── */}
          <FormSection id="amenities" title="Amenities" activeSection={activeSection} onOpen={setActiveSection}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITY_KEYS.map((key) => {
                const checked = form.amenities.includes(key);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-verde-400 bg-verde-50'
                        : 'border-verde-100 bg-surface hover:border-verde-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(key)}
                      className="w-4 h-4 rounded border-verde-300 text-verde-600 focus:ring-verde-500"
                    />
                    <span className="font-body text-sm text-verde-800">
                      {amenityMap[key].label}
                    </span>
                  </label>
                );
              })}
            </div>
          </FormSection>

          {/* ── House Rules ── */}
          <FormSection id="house-rules" title="House Rules" activeSection={activeSection} onOpen={setActiveSection}>
            <div className="space-y-3">
              {form.house_rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-data text-xs text-text-muted w-6 text-right shrink-0">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => setRule(index, e.target.value)}
                    placeholder="Enter a house rule..."
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    disabled={form.house_rules.length <= 1}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRule}
              className="mt-3 inline-flex items-center gap-1.5 text-verde-600 font-body text-sm font-semibold hover:text-verde-700 transition-colors"
            >
              <Plus size={14} />
              Add Rule
            </button>
          </FormSection>

          {/* ── Images ── */}
          <FormSection id="images" title="Images" activeSection={activeSection} onOpen={setActiveSection}>
            <div className="space-y-3">
              {form.images.map((img, index) => (
                <div key={index} className="flex items-start gap-3 bg-verde-50/50 rounded-xl p-3 border border-verde-100">
                  {/* Preview */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-verde-100 shrink-0">
                    {img.url ? (
                      <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-verde-300">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="url"
                      value={img.url}
                      onChange={(e) => setImage(index, 'url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="form-input text-sm"
                    />
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => setImage(index, 'alt', e.target.value)}
                      placeholder="Alt text description"
                      className="form-input text-sm"
                    />
                  </div>

                  {/* Reorder + Delete */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 rounded text-verde-500 hover:bg-verde-100 transition-colors disabled:opacity-30"
                      title="Move up"
                    >
                      <GripVertical size={14} className="rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={index === form.images.length - 1}
                      className="p-1 rounded text-verde-500 hover:bg-verde-100 transition-colors disabled:opacity-30"
                      title="Move down"
                    >
                      <GripVertical size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={form.images.length <= 1}
                      className="p-1 rounded text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImage}
              className="mt-3 inline-flex items-center gap-1.5 text-verde-600 font-body text-sm font-semibold hover:text-verde-700 transition-colors"
            >
              <Plus size={14} />
              Add Image
            </button>
          </FormSection>

          {/* ── Check-in Info ── */}
          <FormSection id="checkin" title="Check-in Info" activeSection={activeSection} onOpen={setActiveSection}>
            <Field label="Door Code Format">
              <input
                type="text"
                value={form.checkin.doorCodeFormat}
                onChange={(e) => setNested('checkin', 'doorCodeFormat', e.target.value)}
                placeholder="e.g. Last 4 digits of phone number"
                className="form-input"
              />
            </Field>
            <Field label="Check-in Instructions">
              <textarea
                value={form.checkin.instructions}
                onChange={(e) => setNested('checkin', 'instructions', e.target.value)}
                rows={3}
                placeholder="Detailed check-in steps..."
                className="form-input resize-y"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="WiFi Name">
                <input
                  type="text"
                  value={form.checkin.wifiName}
                  onChange={(e) => setNested('checkin', 'wifiName', e.target.value)}
                  placeholder="VillaVerde-Guest"
                  className="form-input"
                />
              </Field>
              <Field label="WiFi Password">
                <input
                  type="text"
                  value={form.checkin.wifiPassword}
                  onChange={(e) => setNested('checkin', 'wifiPassword', e.target.value)}
                  placeholder="********"
                  className="form-input"
                />
              </Field>
            </div>
            <Field label="Parking Instructions">
              <textarea
                value={form.checkin.parkingInstructions}
                onChange={(e) => setNested('checkin', 'parkingInstructions', e.target.value)}
                rows={2}
                placeholder="Parking details and directions..."
                className="form-input resize-y"
              />
            </Field>
            <Field label="Additional Notes">
              <textarea
                value={form.checkin.additionalNotes}
                onChange={(e) => setNested('checkin', 'additionalNotes', e.target.value)}
                rows={2}
                placeholder="Any other info guests should know..."
                className="form-input resize-y"
              />
            </Field>
          </FormSection>

          {/* ── Host ── */}
          <FormSection id="host" title="Host" activeSection={activeSection} onOpen={setActiveSection}>
            <Field label="Host Name">
              <input
                type="text"
                value={form.host.name}
                onChange={(e) => setNested('host', 'name', e.target.value)}
                placeholder="Jonathan"
                className="form-input"
              />
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.host.isSuperhost}
                onChange={(e) => setNested('host', 'isSuperhost', e.target.checked)}
                className="w-4 h-4 rounded border-verde-300 text-verde-600 focus:ring-verde-500"
              />
              <span className="font-body text-sm text-verde-800">Superhost</span>
            </label>
            <Field label="Response Time">
              <input
                type="text"
                value={form.host.responseTime}
                onChange={(e) => setNested('host', 'responseTime', e.target.value)}
                placeholder="Within an hour"
                className="form-input"
              />
            </Field>
          </FormSection>

          {/* ── Rating ── */}
          <FormSection id="rating" title="Rating" activeSection={activeSection} onOpen={setActiveSection}>
            <p className="font-body text-sm text-text-muted mb-4">
              Override the displayed rating. Leave blank to hide rating info.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Average Rating" hint="1.0 - 5.0">
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.01"
                  value={form.rating.average}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rating: { ...prev.rating, average: e.target.value },
                    }))
                  }
                  placeholder="4.95"
                  className="form-input font-data"
                />
              </Field>
              <Field label="Review Count">
                <input
                  type="number"
                  min="0"
                  value={form.rating.count}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rating: { ...prev.rating, count: e.target.value },
                    }))
                  }
                  placeholder="127"
                  className="form-input font-data"
                />
              </Field>
            </div>
          </FormSection>

          {/* ── iCal Sync ── */}
          <FormSection id="ical" title="iCal Sync" activeSection={activeSection} onOpen={setActiveSection}>
            <Field label="Airbnb iCal URL" hint="Paste the .ics export URL from your Airbnb listing to sync blocked dates.">
              <input
                type="url"
                value={form.airbnb_ical_url}
                onChange={(e) => set('airbnb_ical_url', e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/12345.ics?s=abc123"
                className="form-input font-data text-sm"
              />
            </Field>
          </FormSection>

          {/* ── Publishing ── */}
          <FormSection id="publish" title="Publishing" activeSection={activeSection} onOpen={setActiveSection}>
            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => set('is_published', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-verde-500 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="font-body font-semibold text-verde-800">
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
                <p className="font-body text-xs text-text-muted">
                  {form.is_published
                    ? 'This property is visible to guests on the public site.'
                    : 'This property is hidden from the public site.'}
                </p>
              </div>
            </label>
          </FormSection>

          {/* Bottom Save */}
          <div className="flex items-center justify-end gap-3 pt-4 pb-8 border-t border-verde-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard/properties')}
              className="px-5 py-2.5 rounded-full font-body font-semibold text-text-secondary hover:bg-verde-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 font-body font-semibold px-6 py-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-transform shadow-tropical disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-verde-800 border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Update Property' : 'Create Property'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ──────────────────────────── sub-components ──────────────────────────── */

function FormSection({ id, title, children, activeSection, onOpen }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section
      id={`section-${id}`}
      className="bg-surface rounded-2xl border border-verde-100 shadow-card overflow-hidden"
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          onOpen(id);
        }}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-verde-50/30 transition-colors"
      >
        <h2 className="font-heading text-lg font-bold text-verde-800">{title}</h2>
        {isOpen ? (
          <ChevronDown size={18} className="text-verde-400" />
        ) : (
          <ChevronRight size={18} className="text-verde-400" />
        )}
      </button>
      {isOpen && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </section>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block font-body text-sm font-medium text-verde-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 font-body text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
