import { useState } from 'react';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Wifi,
  Refrigerator,
  Phone,
  MapPin,
  Bus,
  ScrollText,
  LogIn,
  LogOut,
  ParkingCircle,
  FileText,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useGuidebook } from '@/hooks/useGuidebook';
import {
  createSection,
  updateSection,
  deleteSection,
  toggleSectionPublish,
} from '@/hooks/useGuidebookMutations';
import GuidebookSectionEditor from '@/components/dashboard/GuidebookSectionEditor';
import GuidebookPreview from '@/components/dashboard/GuidebookPreview';

const SECTION_TYPES = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'appliances', label: 'Appliances', icon: Refrigerator },
  { value: 'emergency', label: 'Emergency Contacts', icon: Phone },
  { value: 'local_recs', label: 'Local Recommendations', icon: MapPin },
  { value: 'transportation', label: 'Transportation', icon: Bus },
  { value: 'house_rules', label: 'House Rules', icon: ScrollText },
  { value: 'checkin', label: 'Check-in Instructions', icon: LogIn },
  { value: 'checkout', label: 'Checkout Instructions', icon: LogOut },
  { value: 'parking', label: 'Parking', icon: ParkingCircle },
  { value: 'custom', label: 'Custom', icon: FileText },
];

function getSectionTypeConfig(type) {
  return SECTION_TYPES.find((t) => t.value === type) || SECTION_TYPES[9];
}

export default function GuidebookPage() {
  const { properties } = useProperties();
  const [selectedSlug, setSelectedSlug] = useState('');
  const { sections, loading, error, refetch } = useGuidebook(selectedSlug);

  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionType, setNewSectionType] = useState('wifi');
  const [showPreview, setShowPreview] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const selectedProperty = properties?.find((p) => p.slug === selectedSlug);

  const handleAddSection = async () => {
    if (!selectedSlug || !newSectionType) return;

    const config = getSectionTypeConfig(newSectionType);
    setActionLoading(true);

    try {
      const newSection = await createSection(selectedSlug, {
        section_type: newSectionType,
        title: config.label,
        content: {},
        sort_order: sections.length,
        is_published: true,
      });
      setShowAddForm(false);
      setNewSectionType('wifi');
      await refetch();
      // Auto-open editor for the new section
      setEditingId(newSection.id);
      setExpandedId(newSection.id);
    } catch (err) {
      console.error('Failed to create section:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSection = async (sectionId, data) => {
    try {
      await updateSection(sectionId, data);
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Failed to update section:', err);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Delete this guidebook section?')) return;

    try {
      await deleteSection(id);
      if (editingId === id) setEditingId(null);
      if (expandedId === id) setExpandedId(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete section:', err);
    }
  };

  const handleTogglePublish = async (id, currentState) => {
    try {
      await toggleSectionPublish(id, !currentState);
      refetch();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-verde-800">
            Guest Guidebook
          </h1>
          <p className="text-sm font-body text-verde-500 mt-1">
            Manage property guides and instructions
          </p>
        </div>
        {selectedSlug && sections.length > 0 && (
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-xl text-sm font-heading font-medium hover:bg-gold-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview as Guest
          </button>
        )}
      </div>

      {/* Property Selector */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
        <label className="block text-sm font-heading font-medium text-verde-700 mb-2">
          Select Property
        </label>
        <select
          value={selectedSlug}
          onChange={(e) => {
            setSelectedSlug(e.target.value);
            setEditingId(null);
            setExpandedId(null);
            setShowAddForm(false);
          }}
          className="w-full max-w-md px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
        >
          <option value="">-- Choose a property --</option>
          {(properties || []).map((prop) => (
            <option key={prop.slug} value={prop.slug}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {selectedSlug && (
        <div className="bg-surface rounded-2xl border border-verde-100 shadow-card">
          {/* Section Header */}
          <div className="p-6 border-b border-verde-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-verde-50 rounded-xl">
                  <BookOpen className="w-5 h-5 text-verde-600" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-semibold text-verde-800">
                    Guidebook Sections
                  </h2>
                  <p className="text-xs font-body text-verde-500">
                    {sections.length} section{sections.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-verde-600 text-white rounded-xl text-sm font-heading font-medium hover:bg-verde-700 transition-colors"
              >
                {showAddForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Section
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Section Form */}
          {showAddForm && (
            <div className="p-6 border-b border-verde-100 bg-cream-50">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
                    Section Type
                  </label>
                  <select
                    value={newSectionType}
                    onChange={(e) => setNewSectionType(e.target.value)}
                    className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddSection}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-verde-600 text-white rounded-xl text-sm font-heading font-medium hover:bg-verde-700 transition-colors disabled:opacity-50 shrink-0"
                >
                  {actionLoading ? 'Adding...' : 'Add Section'}
                </button>
              </div>
            </div>
          )}

          {/* Sections List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-verde-400 animate-spin mx-auto mb-2" />
                <p className="text-sm font-body text-verde-500">Loading sections...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-10 h-10 text-verde-300 mx-auto mb-4" />
                <p className="text-base font-heading font-medium text-verde-600 mb-1">
                  No guidebook sections yet.
                </p>
                <p className="text-sm font-body text-verde-400">
                  Add your first section to help guests enjoy their stay.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => {
                  const config = getSectionTypeConfig(section.section_type);
                  const Icon = config.icon;
                  const isExpanded = expandedId === section.id;
                  const isEditing = editingId === section.id;

                  return (
                    <div
                      key={section.id}
                      className="border border-verde-100 rounded-xl bg-white overflow-hidden hover:border-verde-200 transition-colors"
                    >
                      {/* Section Header Row */}
                      <div className="flex items-center justify-between p-4">
                        <button
                          onClick={() => toggleExpand(section.id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-verde-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-verde-400 shrink-0" />
                          )}
                          <div className="p-1.5 bg-verde-50 rounded-lg shrink-0">
                            <Icon className="w-4 h-4 text-verde-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-heading font-semibold text-verde-800 truncate">
                              {section.title}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-verde-50 text-verde-600 rounded-lg text-xs font-heading shrink-0">
                            {config.label}
                          </span>
                        </button>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {/* Publish Toggle */}
                          <button
                            onClick={() =>
                              handleTogglePublish(section.id, section.is_published)
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              section.is_published ? 'bg-verde-500' : 'bg-gray-300'
                            }`}
                            title={section.is_published ? 'Published' : 'Unpublished'}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                                section.is_published ? 'translate-x-4.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => {
                              setExpandedId(section.id);
                              setEditingId(section.id);
                            }}
                            title="Edit"
                            className="p-1.5 text-verde-500 hover:text-verde-700 hover:bg-verde-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            title="Delete"
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content / Editor */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-verde-50">
                          {isEditing ? (
                            <div className="mt-4">
                              <GuidebookSectionEditor
                                section={section}
                                onSave={(data) => handleSaveSection(section.id, data)}
                                onCancel={() => setEditingId(null)}
                              />
                            </div>
                          ) : (
                            <div className="mt-3">
                              <pre className="text-xs font-data text-verde-500 bg-cream-50 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(section.content, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-verde-100 p-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-sm font-heading font-semibold text-verde-700">
                Guest Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 text-verde-500 hover:text-verde-700 hover:bg-verde-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <GuidebookPreview
                sections={sections}
                propertyName={selectedProperty?.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
