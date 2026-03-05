import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { properties } from '@/data/properties';
import { availability as staticAvailability } from '@/data/availability';
import { amenityMap } from '@/data/amenities';
import { getAvailability } from '@/lib/api';
import { useBooking } from '@/context/BookingContext';
import { getNumberOfNights, formatDateRange, isDateBlocked, isPastDate, isSameDay, startOfDay } from '@/utils/dateUtils';
import { calculatePricing, formatCurrency } from '@/utils/priceUtils';
import { formatRating, pluralize } from '@/utils/formatters';
import PropertyGallery from '@/components/property-detail/PropertyGallery';
import AvailabilityCalendar from '@/components/property-detail/AvailabilityCalendar';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import {
  MapPin, Users, BedDouble, Bath, Star, Images, Shield, Clock,
  ChevronDown, Send, CheckCircle,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { updateSearchParams, setSelectedProperty, updateGuestDetails, computePricing, searchParams } = useBooking();

  const property = useMemo(() => properties.find(p => p.slug === slug), [slug]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [checkIn, setCheckIn] = useState(searchParams.checkIn);
  const [checkOut, setCheckOut] = useState(searchParams.checkOut);
  const [guests, setGuests] = useState(searchParams.guests);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });

  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    if (!property) return;
    getAvailability(property.slug)
      .then(dates => setBlockedDates(dates))
      .catch(() => {
        setBlockedDates(staticAvailability[property.id]?.blockedDates || []);
      });
  }, [property]);

  const nights = getNumberOfNights(checkIn, checkOut);
  const pricing = useMemo(() => {
    if (!property || nights <= 0) return null;
    return calculatePricing(property.pricing, nights);
  }, [property, nights]);

  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.detail-anim'), {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2,
    });
  });

  const handleDateSelect = useCallback((date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      if (date > checkIn) {
        setCheckOut(date);
      } else {
        setCheckIn(date);
        setCheckOut(null);
      }
    }
  }, [checkIn, checkOut]);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!property || !checkIn || !checkOut || !pricing || guests < 1) return;
    updateSearchParams({ checkIn, checkOut, guests });
    setSelectedProperty(property);
    updateGuestDetails(form);
    computePricing(property.pricing, checkIn, checkOut);
    navigate('/booking/checkout');
  };

  if (!property) {
    return (
      <div className="pt-32 pb-20 px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-heading text-3xl font-bold text-verde-800 mb-4">Property Not Found</h1>
        <button onClick={() => navigate('/properties')} className="text-verde-500 font-body font-semibold underline">
          Browse all properties
        </button>
      </div>
    );
  }

  const displayedAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 8);
  const displayedReviews = showAllReviews ? property.reviews : property.reviews.slice(0, 3);

  return (
    <div className="pt-20">
      {/* Hero Image Grid */}
      <section ref={heroRef} className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 h-[50vh] md:h-[60vh]">
          <div
            className="md:col-span-2 md:row-span-2 relative cursor-pointer group overflow-hidden"
            onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
          >
            <img
              src={property.images[0].url}
              alt={property.images[0].alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {property.images.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="hidden md:block relative cursor-pointer group overflow-hidden"
              onClick={() => { setGalleryIndex(i + 1); setGalleryOpen(true); }}
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
          <button
            onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
            className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-body font-medium text-verde-800 flex items-center gap-2 hover:bg-surface transition-colors shadow-card"
          >
            <Images size={16} /> All Photos ({property.images.length})
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div className="detail-anim">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge variant="gold">{property.details.propertyType}</Badge>
                {property.host.isSuperhost && <Badge variant="success"><Shield size={12} /> Superhost</Badge>}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-2">{property.name}</h1>
              <p className="text-text-secondary font-body text-lg mb-1 flex items-center gap-1">
                <MapPin size={16} className="text-verde-400" />
                {property.location.address}, {property.location.neighborhood}, {property.location.city}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-gold-500 text-gold-500" />
                  <span className="font-data text-sm font-bold">{formatRating(property.rating.average)}</span>
                  <span className="text-text-muted text-sm font-body">({property.rating.count} reviews)</span>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-6 py-6 border-y border-verde-100">
              {[
                { icon: Users, label: pluralize(property.details.maxGuests, 'guest') },
                { icon: BedDouble, label: pluralize(property.details.bedrooms, 'bedroom') },
                { icon: BedDouble, label: pluralize(property.details.beds, 'bed') },
                { icon: Bath, label: pluralize(property.details.bathrooms, 'bathroom') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-verde-700 font-body">
                  <Icon size={18} className="text-verde-400" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-verde-800 mb-4">About This Property</h2>
              {property.description.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-text-secondary font-body leading-relaxed mb-4">{para}</p>
              ))}
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-verde-800 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayedAmenities.map(key => {
                  const amenity = amenityMap[key];
                  if (!amenity) return null;
                  const Icon = LucideIcons[amenity.icon] || LucideIcons.Check;
                  return (
                    <div key={key} className="flex items-center gap-3 py-2">
                      <div className="w-9 h-9 rounded-lg bg-verde-50 flex items-center justify-center">
                        <Icon size={16} className="text-verde-500" />
                      </div>
                      <span className="font-body text-verde-700 text-sm">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
              {property.amenities.length > 8 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-verde-500 font-body font-semibold text-sm flex items-center gap-1"
                >
                  {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
                  <ChevronDown size={16} className={showAllAmenities ? 'rotate-180' : ''} />
                </button>
              )}
            </div>

            {/* House Rules */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-verde-800 mb-4">House Rules</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.houseRules.map(rule => (
                  <li key={rule} className="flex items-center gap-2 text-text-secondary font-body text-sm py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-verde-300" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="font-heading text-2xl font-bold text-verde-800">Guest Reviews</h2>
                <div className="flex items-center gap-1 bg-verde-50 px-3 py-1 rounded-full">
                  <Star size={14} className="fill-gold-500 text-gold-500" />
                  <span className="font-data text-sm font-bold">{formatRating(property.rating.average)}</span>
                </div>
              </div>

              <div className="space-y-6">
                {displayedReviews.map(review => (
                  <div key={review.id} className="border-b border-verde-50 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-heading font-bold text-verde-800">{review.name}</span>
                        <span className="text-text-muted font-body text-sm ml-2">{review.location}</span>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-text-secondary font-body leading-relaxed">{review.text}</p>
                    <span className="text-text-muted font-data text-xs mt-2 block">{review.date}</span>
                  </div>
                ))}
              </div>

              {property.reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 text-verde-500 font-body font-semibold text-sm flex items-center gap-1"
                >
                  {showAllReviews ? 'Show less' : `Show all ${property.reviews.length} reviews`}
                  <ChevronDown size={16} className={showAllReviews ? 'rotate-180' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Header */}
              <div className="bg-surface rounded-3xl border border-verde-100 shadow-card p-6">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-data text-3xl font-bold text-verde-800">${property.pricing.nightlyRate}</span>
                  <span className="text-text-muted font-body">/ night</span>
                </div>

                {/* Calendar */}
                <AvailabilityCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onDateSelect={handleDateSelect}
                  blockedDates={blockedDates}
                  minimumStay={property.pricing.minimumStay}
                />

                {/* Guest Count */}
                <div className="mt-4">
                  <label className="block text-sm font-body font-medium text-verde-700 mb-1.5">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
                  >
                    <option value={0}>Select guests</option>
                    {Array.from({ length: property.details.maxGuests }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                {pricing && (
                  <div className="mt-6 pt-4 border-t border-verde-100 space-y-2 text-sm font-body">
                    <div className="flex justify-between text-text-secondary">
                      <span>{formatCurrency(pricing.nightlyRate)} x {pricing.nights} nights</span>
                      <span className="font-data">{formatCurrency(pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Cleaning fee</span>
                      <span className="font-data">{formatCurrency(pricing.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Service fee</span>
                      <span className="font-data">{formatCurrency(pricing.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Taxes</span>
                      <span className="font-data">{formatCurrency(pricing.taxes)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-verde-100 text-base font-bold">
                      <span className="font-heading text-verde-800">Total</span>
                      <span className="font-data text-gold-600">{formatCurrency(pricing.total)}</span>
                    </div>
                  </div>
                )}

                {checkIn && checkOut && (
                  <div className="mt-3 text-center">
                    <span className="text-xs font-data text-text-muted">
                      {formatDateRange(checkIn, checkOut)}
                    </span>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              {pricing && (
                <div className="bg-surface rounded-3xl border border-verde-100 shadow-card p-6">
                  {formSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-full bg-verde-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={28} className="text-verde-500" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-verde-800 mb-2">Booking Submitted!</h3>
                      <p className="text-text-secondary font-body text-sm">Redirecting to confirmation...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleBooking} className="space-y-4">
                      <h3 className="font-heading text-lg font-bold text-verde-800 mb-2">Complete Your Booking</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text" required placeholder="First name"
                          value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                          className="px-3 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
                        />
                        <input
                          type="text" required placeholder="Last name"
                          value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                          className="px-3 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
                        />
                      </div>
                      <input
                        type="email" required placeholder="Email address"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
                      />
                      <input
                        type="tel" required placeholder="Phone number"
                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
                      />
                      <textarea
                        rows={2} placeholder="Special requests (optional)"
                        value={form.specialRequests} onChange={e => setForm({ ...form, specialRequests: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full bg-gold-500 text-verde-800 py-3 rounded-xl font-body font-bold flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors"
                      >
                        <Send size={16} /> Reserve Now — {formatCurrency(pricing.total)}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Host Info */}
              <div className="bg-surface rounded-3xl border border-verde-100 shadow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-verde-100 flex items-center justify-center">
                    <span className="font-heading font-bold text-verde-600 text-lg">VV</span>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-verde-800">{property.host.name}</div>
                    {property.host.isSuperhost && (
                      <span className="text-xs font-data text-gold-600">Superhost</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted font-body">
                  <Clock size={14} />
                  Response time: {property.host.responseTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <Modal isOpen={galleryOpen} onClose={() => setGalleryOpen(false)}>
        <PropertyGallery
          images={property.images}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      </Modal>
    </div>
  );
}
