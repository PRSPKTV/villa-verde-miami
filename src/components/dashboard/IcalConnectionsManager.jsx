import { useState } from 'react';
import {
  Link2,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useIcalConnections } from '@/hooks/useIcalConnections';
import {
  addConnection,
  updateConnection,
  deleteConnection,
  triggerSync,
} from '@/hooks/useIcalMutations';

const PLATFORM_OPTIONS = [
  { value: 'airbnb', label: 'Airbnb', color: 'bg-rose-100 text-rose-700' },
  { value: 'vrbo', label: 'VRBO', color: 'bg-blue-100 text-blue-700' },
  { value: 'booking', label: 'Booking.com', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

function getPlatformConfig(platform) {
  return PLATFORM_OPTIONS.find((p) => p.value === platform) || PLATFORM_OPTIONS[3];
}

function StatusBadge({ status }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-data bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" />
        Synced
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-data bg-red-100 text-red-700">
        <AlertCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-data bg-yellow-100 text-yellow-700">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

export default function IcalConnectionsManager({ propertySlug }) {
  const { connections, loading, error, refetch } = useIcalConnections(propertySlug);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [syncingId, setSyncingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Add form state
  const [newPlatform, setNewPlatform] = useState('airbnb');
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const exportUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-ical?slug=${propertySlug}`;

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      setFormError('iCal URL is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await addConnection(propertySlug, newPlatform, newUrl.trim(), newLabel.trim() || null);
      setNewPlatform('airbnb');
      setNewUrl('');
      setNewLabel('');
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    setFormError(null);

    try {
      await updateConnection(id, editData);
      setEditingId(null);
      setEditData({});
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this iCal connection?')) return;

    try {
      await deleteConnection(id);
      refetch();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSync = async (connectionId) => {
    setSyncingId(connectionId);
    try {
      await triggerSync(connectionId);
      refetch();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const input = document.createElement('input');
      input.value = exportUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startEdit = (conn) => {
    setEditingId(conn.id);
    setEditData({
      platform: conn.platform,
      ical_url: conn.ical_url,
      platform_label: conn.platform_label || '',
    });
  };

  const truncateUrl = (url, maxLen = 50) => {
    if (!url || url.length <= maxLen) return url;
    return url.substring(0, maxLen) + '...';
  };

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-card">
      {/* Header */}
      <div className="p-6 border-b border-verde-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-verde-50 rounded-xl">
              <Link2 className="w-5 h-5 text-verde-600" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-verde-800">
                iCal Connections
              </h2>
              <p className="text-sm font-body text-verde-500">
                Sync calendars from booking platforms
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
                Add Connection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Connection Form */}
      {showAddForm && (
        <div className="p-6 border-b border-verde-100 bg-cream-50">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
                  Platform
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. My Airbnb listing"
                  className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-heading font-medium text-verde-700 mb-1">
                iCal URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/..."
                className="w-full px-3 py-2 border border-verde-200 rounded-xl text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600 font-body">{formError}</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-verde-600 text-white rounded-xl text-sm font-heading font-medium hover:bg-verde-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connections List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 text-verde-400 animate-spin mx-auto mb-2" />
            <p className="text-sm font-body text-verde-500">Loading connections...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-body text-red-600">{error}</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-8 h-8 text-verde-300 mx-auto mb-3" />
            <p className="text-sm font-body text-verde-500">
              No iCal connections yet. Add one to start syncing calendars.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => {
              const platformCfg = getPlatformConfig(conn.platform);
              const isEditing = editingId === conn.id;
              const isSyncing = syncingId === conn.id;

              return (
                <div
                  key={conn.id}
                  className="border border-verde-100 rounded-xl p-4 bg-white hover:border-verde-200 transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-heading font-medium text-verde-600 mb-1">
                            Platform
                          </label>
                          <select
                            value={editData.platform}
                            onChange={(e) =>
                              setEditData({ ...editData, platform: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-verde-200 rounded-lg text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
                          >
                            {PLATFORM_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-heading font-medium text-verde-600 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={editData.platform_label}
                            onChange={(e) =>
                              setEditData({ ...editData, platform_label: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-verde-200 rounded-lg text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-heading font-medium text-verde-600 mb-1">
                          iCal URL
                        </label>
                        <input
                          type="url"
                          value={editData.ical_url}
                          onChange={(e) =>
                            setEditData({ ...editData, ical_url: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-verde-200 rounded-lg text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-verde-300"
                        />
                      </div>
                      {formError && (
                        <p className="text-xs text-red-600 font-body">{formError}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditData({});
                            setFormError(null);
                          }}
                          className="px-3 py-1.5 text-sm font-heading text-verde-600 hover:bg-verde-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(conn.id)}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm font-heading font-medium bg-verde-600 text-white rounded-lg hover:bg-verde-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-heading font-medium whitespace-nowrap ${platformCfg.color}`}
                        >
                          {conn.platform_label || platformCfg.label}
                        </span>
                        <span
                          className="text-xs font-data text-verde-500 truncate"
                          title={conn.ical_url}
                        >
                          {truncateUrl(conn.ical_url)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {conn.last_synced_at && (
                          <span className="text-xs font-data text-verde-400 whitespace-nowrap hidden sm:inline">
                            {formatDistanceToNow(new Date(conn.last_synced_at), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        <StatusBadge status={conn.sync_status} />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSync(conn.id)}
                            disabled={isSyncing}
                            title="Sync now"
                            className="p-1.5 text-verde-500 hover:text-verde-700 hover:bg-verde-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                            />
                          </button>
                          <button
                            onClick={() => startEdit(conn)}
                            title="Edit"
                            className="p-1.5 text-verde-500 hover:text-verde-700 hover:bg-verde-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(conn.id)}
                            title="Delete"
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="p-6 border-t border-verde-100 bg-cream-50 rounded-b-2xl">
        <div className="flex items-center gap-3 mb-3">
          <ExternalLink className="w-4 h-4 text-verde-600" />
          <h3 className="text-sm font-heading font-semibold text-verde-700">
            Export Calendar
          </h3>
        </div>
        <p className="text-xs font-body text-verde-500 mb-3">
          Share this URL with other platforms to export your availability.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-verde-200 rounded-xl px-3 py-2 overflow-hidden">
            <p className="text-xs font-data text-verde-600 truncate">{exportUrl}</p>
          </div>
          <button
            onClick={handleCopyExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-verde-600 text-white rounded-xl text-xs font-heading font-medium hover:bg-verde-700 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
