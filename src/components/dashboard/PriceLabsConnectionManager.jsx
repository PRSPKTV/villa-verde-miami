import { useState } from 'react';
import { RefreshCw, TrendingUp, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { usePriceLabsListings } from '@/hooks/usePriceLabsListings';
import { syncListings, syncNeighborhood, syncAll } from '@/hooks/usePriceLabsMutations';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/hooks/useProperties';
import { format } from 'date-fns';

export default function PriceLabsConnectionManager({ propertySlug }) {
  const { listings, loading, error, refetch } = usePriceLabsListings();
  const { properties } = useProperties();
  const [syncing, setSyncing] = useState(null); // 'listings' | 'neighborhood' | 'all' | null
  const [syncError, setSyncError] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(null);

  const handleSyncListings = async () => {
    setSyncing('listings');
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const result = await syncListings();
      setSyncSuccess(`Synced ${result.count || 0} listings from PriceLabs`);
      refetch();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncNeighborhood = async (slug) => {
    setSyncing('neighborhood');
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const result = await syncNeighborhood(slug);
      setSyncSuccess(`Synced market data: ${result.daily_count || 0} daily records, ${result.kpi_count || 0} KPI records`);
      refetch();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncing('all');
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const result = await syncAll();
      setSyncSuccess(`Full sync complete — ${result.listings_count || 0} listings, ${result.neighborhood_results?.length || 0} properties synced`);
      refetch();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleMapProperty = async (listingId, newSlug) => {
    const { error: err } = await supabase
      .from('pricelabs_listing_map')
      .update({ property_slug: newSlug })
      .eq('pricelabs_listing_id', listingId);
    if (err) {
      setSyncError(err.message);
    } else {
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Sync Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-xl font-bold text-verde-800">PriceLabs Connection</h3>
          <p className="font-body text-sm text-text-muted mt-1">Manage listing mappings and sync market data</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSyncListings}
            disabled={!!syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-verde-50 text-verde-700 rounded-lg font-body text-sm font-medium hover:bg-verde-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing === 'listings' ? 'animate-spin' : ''} />
            Sync Listings
          </button>
          <button
            onClick={handleSyncAll}
            disabled={!!syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-verde-500 text-cream-100 rounded-lg font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing === 'all' ? 'animate-spin' : ''} />
            {syncing === 'all' ? 'Syncing All...' : 'Sync All'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {syncError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="font-body text-sm text-red-700">{syncError}</p>
        </div>
      )}
      {syncSuccess && (
        <div className="flex items-center gap-2 bg-verde-50 border border-verde-200 rounded-xl p-3">
          <CheckCircle size={16} className="text-verde-600 shrink-0" />
          <p className="font-body text-sm text-verde-700">{syncSuccess}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="font-body text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-verde-100 p-8 text-center">
          <TrendingUp size={32} className="text-text-muted mx-auto mb-3" />
          <p className="font-body text-sm text-text-muted">No PriceLabs listings found. Click "Sync Listings" to fetch them.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-verde-100 shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-verde-100 bg-cream-50">
                <th className="text-left px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">PriceLabs Listing</th>
                <th className="text-left px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">PMS</th>
                <th className="text-left px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">Mapped Property</th>
                <th className="text-right px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">Rec. Base</th>
                <th className="text-right px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">Occ 7d</th>
                <th className="text-right px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">Mkt Occ 7d</th>
                <th className="text-center px-4 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-verde-50 hover:bg-cream-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-body text-sm font-medium text-text-primary">{listing.pricelabs_name || listing.pricelabs_listing_id}</p>
                    <p className="font-data text-[10px] text-text-muted">{listing.bedrooms}BR &middot; ID: {listing.pricelabs_listing_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-data font-semibold bg-gold-100 text-gold-800 uppercase">
                      {listing.pms || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={listing.property_slug || ''}
                      onChange={(e) => handleMapProperty(listing.pricelabs_listing_id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-verde-200 font-body text-xs focus:outline-none focus:ring-2 focus:ring-verde-400 min-w-[180px]"
                    >
                      <option value="">— Unmapped —</option>
                      {(properties || []).map((p) => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-data text-sm text-verde-700 font-semibold">
                      {listing.recommended_base_price ? `$${(listing.recommended_base_price / 100).toFixed(0)}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-data text-sm text-text-primary">
                      {listing.occupancy_next_7 != null ? `${(listing.occupancy_next_7 * 100).toFixed(0)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-data text-sm text-text-secondary">
                      {listing.market_occ_next_7 != null ? `${(listing.market_occ_next_7 * 100).toFixed(0)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSyncNeighborhood(listing.property_slug)}
                      disabled={!!syncing || !listing.property_slug}
                      title={!listing.property_slug ? 'Map a property first' : 'Sync market data for this listing'}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-verde-50 text-verde-700 rounded-lg font-body text-xs font-medium hover:bg-verde-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={12} className={syncing === 'neighborhood' ? 'animate-spin' : ''} />
                      Sync
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Last synced */}
          {listings.some(l => l.last_synced_at) && (
            <div className="px-4 py-2 border-t border-verde-100 bg-cream-50">
              <p className="font-data text-[10px] text-text-muted">
                Last synced: {format(new Date(listings.find(l => l.last_synced_at)?.last_synced_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
