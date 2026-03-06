import { priceLabsAction } from '@/lib/api';

export async function syncListings() {
  return priceLabsAction('fetch-listings');
}

export async function syncNeighborhood(propertySlug) {
  return priceLabsAction('fetch-neighborhood', { property_slug: propertySlug });
}

export async function syncAll() {
  return priceLabsAction('sync-all');
}

export async function applyMarketPrices(propertySlug, startDate, endDate) {
  return priceLabsAction('apply-prices', {
    property_slug: propertySlug,
    start_date: startDate,
    end_date: endDate,
  });
}
