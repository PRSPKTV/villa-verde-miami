import { useBooking } from '@/context/BookingContext';
import { formatDateRange } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/priceUtils';
import { formatGuestCount } from '@/utils/formatters';
import { CheckCircle, Calendar, Users, MapPin, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BookingConfirmationPage() {
  const { selectedProperty, searchParams, guestDetails, pricing, confirmedBooking, resetBooking } = useBooking();

  const confirmationId = confirmedBooking?.confirmationCode || 'N/A';

  if (!selectedProperty || !pricing) {
    return (
      <div className="pt-32 pb-20 px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-heading text-3xl font-bold text-verde-800 mb-4">No Booking Found</h1>
        <p className="text-text-secondary font-body mb-8">Start by selecting a property and dates.</p>
        <Button to="/properties">Browse Properties</Button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-verde-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-verde-500" />
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-3">Booking Confirmed!</h1>
        <p className="text-text-secondary font-body text-lg">
          Your reservation at {selectedProperty.name} is all set.
        </p>
        {confirmedBooking && (
          <div className="mt-3 inline-flex items-center gap-2 bg-verde-100 px-4 py-2 rounded-full">
            <CreditCard size={14} className="text-verde-600" />
            <span className="font-data text-sm font-medium text-verde-700">Payment Successful</span>
          </div>
        )}
        <div className="mt-3 inline-flex items-center gap-2 bg-verde-50 px-4 py-2 rounded-full">
          <span className="font-data text-sm text-text-muted">Confirmation:</span>
          <span className="font-data text-sm font-bold text-verde-700">{confirmationId}</span>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-verde-100 shadow-card overflow-hidden">
        <div className="relative h-48">
          <img
            src={selectedProperty.images[0].url}
            alt={selectedProperty.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-verde-800/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h2 className="font-heading text-2xl font-bold text-cream-100">{selectedProperty.name}</h2>
            <p className="text-cream-200/80 text-sm font-body flex items-center gap-1">
              <MapPin size={14} /> {selectedProperty.location.neighborhood}, {selectedProperty.location.city}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-cream-100 rounded-xl p-4">
              <Calendar size={20} className="text-verde-500" />
              <div>
                <div className="font-data text-xs text-text-muted uppercase tracking-wider">Dates</div>
                <div className="font-body font-medium text-verde-800">
                  {formatDateRange(searchParams.checkIn, searchParams.checkOut)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-cream-100 rounded-xl p-4">
              <Users size={20} className="text-verde-500" />
              <div>
                <div className="font-data text-xs text-text-muted uppercase tracking-wider">Guests</div>
                <div className="font-body font-medium text-verde-800">
                  {formatGuestCount(searchParams.guests)}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-verde-100 pt-6">
            <h3 className="font-heading text-lg font-bold text-verde-800 mb-3">Guest Details</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm font-body">
              <div><span className="text-text-muted">Name:</span> <span className="text-verde-800">{guestDetails.firstName} {guestDetails.lastName}</span></div>
              <div><span className="text-text-muted">Email:</span> <span className="text-verde-800">{guestDetails.email}</span></div>
              <div><span className="text-text-muted">Phone:</span> <span className="text-verde-800">{guestDetails.phone}</span></div>
            </div>
            {guestDetails.specialRequests && (
              <div className="mt-3 text-sm font-body">
                <span className="text-text-muted">Special requests:</span>
                <p className="text-verde-800 mt-1">{guestDetails.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="border-t border-verde-100 pt-6">
            <h3 className="font-heading text-lg font-bold text-verde-800 mb-3">Price Summary</h3>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-text-secondary">{formatCurrency(pricing.nightlyRate)} x {pricing.nights} nights</span>
                <span className="font-data">{formatCurrency(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Cleaning fee</span>
                <span className="font-data">{formatCurrency(pricing.cleaningFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Service fee</span>
                <span className="font-data">{formatCurrency(pricing.serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Taxes</span>
                <span className="font-data">{formatCurrency(pricing.taxes)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-verde-100 text-lg font-bold">
                <span className="font-heading text-verde-800">Total</span>
                <span className="font-data text-gold-600">{formatCurrency(pricing.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <Button to={`/properties/${selectedProperty.slug}`} variant="secondary">View Property</Button>
        <Button to="/" onClick={resetBooking}>Back to Home</Button>
      </div>
    </div>
  );
}
