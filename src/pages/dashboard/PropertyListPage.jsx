import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { usePropertyMutations } from '@/hooks/usePropertyMutations';
import { Plus, Pencil, Trash2, Eye, EyeOff, Building2, Image as ImageIcon } from 'lucide-react';

export default function PropertyListPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { deleteProperty, togglePublish } = usePropertyMutations();

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error) setProperties(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await togglePublish(id, !currentStatus);
      await fetchProperties();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProperty(deleteTarget.id);
      setDeleteTarget(null);
      await fetchProperties();
    } catch (err) {
      console.error('Failed to delete property:', err);
    } finally {
      setDeleting(false);
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-verde-800">Properties</h1>
          <p className="text-text-secondary font-body mt-1">
            Manage your listings, pricing, and availability.
          </p>
        </div>
        <Link
          to="/dashboard/properties/new"
          className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 font-body font-semibold px-5 py-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-transform shadow-tropical"
        >
          <Plus size={18} />
          Add Property
        </Link>
      </div>

      {/* Property List */}
      {properties.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-verde-300" />
          <h2 className="font-heading text-xl font-bold text-verde-800 mb-2">No properties yet</h2>
          <p className="text-text-muted font-body mb-6">
            Add your first property to start accepting bookings.
          </p>
          <Link
            to="/dashboard/properties/new"
            className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 font-body font-semibold px-6 py-3 rounded-full hover:scale-[1.03] active:scale-95 transition-transform shadow-tropical"
          >
            <Plus size={18} />
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-verde-100 shadow-card overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-[80px_1fr_140px_120px_100px_120px] gap-4 items-center px-5 py-3 bg-verde-50/50 border-b border-verde-100 text-text-muted font-body text-xs uppercase tracking-wider font-semibold">
            <span>Image</span>
            <span>Property</span>
            <span>Type</span>
            <span className="text-right">Nightly Rate</span>
            <span className="text-center">Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-verde-50">
            {properties.map((property) => {
              const thumbnail = property.images?.[0]?.url;
              const pricing = property.pricing || {};
              const details = property.details || {};

              return (
                <div
                  key={property.id}
                  className="grid grid-cols-1 md:grid-cols-[80px_1fr_140px_120px_100px_120px] gap-4 items-center px-5 py-4 hover:bg-verde-50/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-verde-100 flex-shrink-0">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-verde-300">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>

                  {/* Name & Slug */}
                  <div className="min-w-0">
                    <div className="font-body font-semibold text-verde-800 truncate">
                      {property.name}
                    </div>
                    <div className="font-data text-xs text-text-muted truncate">
                      /{property.slug}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="font-body text-sm text-text-secondary">
                    {details.propertyType || '---'}
                  </div>

                  {/* Nightly Rate */}
                  <div className="font-data text-sm font-semibold text-verde-700 md:text-right">
                    {pricing.nightlyRate
                      ? `$${Number(pricing.nightlyRate).toLocaleString()}`
                      : '---'}
                    {pricing.nightlyRate && (
                      <span className="text-text-muted font-normal text-xs"> /night</span>
                    )}
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center md:justify-center">
                    <button
                      onClick={() => handleTogglePublish(property.id, property.is_published)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold transition-colors ${
                        property.is_published
                          ? 'bg-verde-100 text-verde-700 hover:bg-verde-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={property.is_published ? 'Click to unpublish' : 'Click to publish'}
                    >
                      {property.is_published ? (
                        <>
                          <Eye size={12} />
                          Live
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          Draft
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:justify-end">
                    <Link
                      to={`/dashboard/properties/${property.id}`}
                      className="p-2 rounded-lg text-verde-600 hover:bg-verde-100 transition-colors"
                      title="Edit property"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(property)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete property"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-verde-900/70 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative z-10 bg-surface rounded-2xl shadow-elevated p-6 mx-4 w-full max-w-md border border-verde-100">
            <h3 className="font-heading text-xl font-bold text-verde-800 mb-2">
              Delete Property
            </h3>
            <p className="text-text-secondary font-body mb-1">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-verde-800">{deleteTarget.name}</span>?
            </p>
            <p className="text-text-muted font-body text-sm mb-6">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-full font-body font-semibold text-sm text-text-secondary hover:bg-verde-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-full font-body font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete Property
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
