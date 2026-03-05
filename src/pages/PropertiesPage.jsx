import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { properties } from '@/data/properties';
import PropertyCard from '@/components/properties/PropertyCard';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { SlidersHorizontal, X } from 'lucide-react';

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [guestFilter, setGuestFilter] = useState(parseInt(searchParams.get('guests')) || 0);
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      if (guestFilter > 0 && p.details.maxGuests < guestFilter) return false;
      if (bedroomFilter > 0 && p.details.bedrooms < bedroomFilter) return false;
      if (p.pricing.nightlyRate > priceMax) return false;
      return true;
    });
  }, [guestFilter, bedroomFilter, priceMax]);

  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.property-card'), {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  const clearFilters = () => {
    setGuestFilter(0);
    setBedroomFilter(0);
    setPriceMax(500);
  };

  const hasActiveFilters = guestFilter > 0 || bedroomFilter > 0 || priceMax < 500;

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-3">Our Properties</h1>
        <p className="text-text-secondary font-body text-lg max-w-xl">
          Handpicked retreats in the heart of Little Havana. Each one curated for comfort, style, and an authentic Miami experience.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-verde-200 text-verde-600 font-body text-sm font-medium hover:bg-verde-50 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-verde-50 text-verde-500 font-body text-sm font-medium hover:bg-verde-100 transition-colors"
          >
            <X size={14} /> Clear all
          </button>
        )}

        <span className="text-text-muted font-data text-sm ml-auto">
          {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {showFilters && (
        <div className="mb-8 p-6 bg-surface rounded-2xl border border-verde-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">Guests</label>
            <select
              value={guestFilter}
              onChange={(e) => setGuestFilter(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}+ guests</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">Bedrooms</label>
            <select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            >
              <option value={0}>Any</option>
              {[1, 2, 3].map(n => (
                <option key={n} value={n}>{n}+ bedrooms</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">
              Max price: <span className="font-data text-gold-600">${priceMax}/night</span>
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(parseInt(e.target.value))}
              className="w-full accent-verde-500"
            />
          </div>
        </div>
      )}

      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(property => (
          <div key={property.id} className="property-card">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted font-body text-lg mb-4">No properties match your filters.</p>
          <button onClick={clearFilters} className="text-verde-500 font-body font-semibold underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
