import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, BedDouble, Bath, Heart, Award } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function PropertyCard({ property }) {
  const { slug, name, tagline, images, location, pricing, details, rating, host } = property;
  const [liked, setLiked] = useState(false);

  return (
    <Link
      to={`/properties/${slug}`}
      className="group block bg-surface rounded-3xl border border-verde-100 overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={images[0].url}
          alt={images[0].alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="gold">{details.propertyType}</Badge>
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
              className="w-8 h-8 rounded-full bg-surface/70 backdrop-blur-sm flex items-center justify-center hover:bg-surface/90 transition-colors"
              aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={16}
                className={`transition-colors ${liked ? 'fill-terracotta-500 text-terracotta-500' : 'text-verde-800'}`}
              />
            </button>
            <div className="bg-surface/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
              <Star size={12} className="fill-gold-500 text-gold-500" />
              <span className="font-data text-xs font-bold text-verde-800">{rating.average}</span>
            </div>
          </div>
          {host?.isSuperhost && (
            <span className="bg-surface/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-body font-medium text-verde-700">
              <Award size={11} className="text-gold-500" /> Superhost
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-xl font-bold text-verde-800 mb-1 group-hover:text-verde-600 transition-colors">
          {name}
        </h3>
        <p className="text-text-muted font-body text-sm mb-3">
          {location.neighborhood}, {location.city}
        </p>
        <p className="text-text-secondary font-body text-sm mb-4 line-clamp-2">
          {tagline}
        </p>

        <div className="flex items-center gap-4 text-text-secondary text-sm font-body mb-4">
          <span className="flex items-center gap-1"><Users size={14} /> {details.maxGuests}</span>
          <span className="flex items-center gap-1"><BedDouble size={14} /> {details.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={14} /> {details.bathrooms}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-verde-50">
          <div>
            <span className="font-data text-lg font-bold text-verde-800">${pricing.nightlyRate}</span>
            <span className="text-text-muted font-body text-sm"> / night</span>
          </div>
          <span className="text-sm font-body font-medium text-verde-500 group-hover:translate-x-1 transition-transform">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
