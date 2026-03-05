import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBooking } from '@/context/BookingContext';
import { formatCurrency } from '@/utils/priceUtils';
import { formatDateRange } from '@/utils/dateUtils';
import { formatGuestCount } from '@/utils/formatters';
import { createPaymentIntent, confirmBooking } from '@/lib/api';
import { MapPin, Calendar, Users, Lock, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const cardStyle = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: '#1a5c3a',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
  },
};

function PaymentForm({ clientSecret, bookingId, confirmationCode }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { selectedProperty, pricing, setPaymentState, setConfirmedBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);
    setPaymentState({ status: 'processing', error: null });

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      setPaymentState({ status: 'error', error: stripeError.message });
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        const { booking } = await confirmBooking(bookingId, paymentIntent.id);
        setConfirmedBooking(booking);
        setPaymentState({ status: 'succeeded', error: null });
        navigate('/booking/confirmation');
      } catch (err) {
        setError('Payment succeeded but confirmation failed. Please contact us with code: ' + confirmationCode);
        setProcessing(false);
        setPaymentState({ status: 'error', error: err.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-body font-medium text-verde-700 mb-2">
          Card Details
        </label>
        <div className="border border-verde-200 rounded-xl p-4 bg-cream-50 focus-within:ring-2 focus-within:ring-verde-400 focus-within:border-verde-400 transition-all">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-body">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gold-500 text-verde-800 py-4 rounded-xl font-body font-bold text-lg flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock size={16} />
            Pay {formatCurrency(pricing.total)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-text-muted text-xs font-body">
        <Lock size={12} />
        Secured by Stripe. Your card info never touches our servers.
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { selectedProperty, searchParams, guestDetails, pricing } = useBooking();
  const [clientSecret, setClientSecret] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState(null);
  const [initError, setInitError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect if no booking data
  useEffect(() => {
    if (!selectedProperty || !pricing) {
      navigate('/properties');
    }
  }, [selectedProperty, pricing, navigate]);

  // Create payment intent on mount
  useEffect(() => {
    if (!selectedProperty || !pricing || !searchParams.checkIn || !searchParams.checkOut) return;

    const init = async () => {
      try {
        const data = await createPaymentIntent({
          propertySlug: selectedProperty.slug,
          propertyName: selectedProperty.name,
          checkIn: searchParams.checkIn.toISOString().split('T')[0],
          checkOut: searchParams.checkOut.toISOString().split('T')[0],
          guests: searchParams.guests,
          nights: pricing.nights,
          guestFirstName: guestDetails.firstName,
          guestLastName: guestDetails.lastName,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          specialRequests: guestDetails.specialRequests || '',
          nightlyRate: pricing.nightlyRate * 100,
          subtotal: pricing.subtotal * 100,
          cleaningFee: pricing.cleaningFee * 100,
          serviceFee: pricing.serviceFee * 100,
          taxes: pricing.taxes * 100,
          total: pricing.total * 100,
        });

        setClientSecret(data.clientSecret);
        setBookingId(data.bookingId);
        setConfirmationCode(data.confirmationCode);
      } catch (err) {
        setInitError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [selectedProperty, pricing, searchParams, guestDetails]);

  if (!selectedProperty || !pricing) return null;

  const elementsOptions = useMemo(() => clientSecret ? {
    clientSecret,
    appearance: { theme: 'stripe' },
  } : null, [clientSecret]);

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-verde-600 font-body font-medium mb-8 hover:text-verde-800 transition-colors"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-8">
        Complete Your Booking
      </h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left — Booking Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-3xl border border-verde-100 shadow-card overflow-hidden">
            <div className="relative h-40">
              <img
                src={selectedProperty.images[0].url}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-verde-800/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <h2 className="font-heading text-xl font-bold text-cream-100">{selectedProperty.name}</h2>
                <p className="text-cream-200/80 text-xs font-body flex items-center gap-1">
                  <MapPin size={12} /> {selectedProperty.location.neighborhood}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-verde-500 shrink-0" />
                <div>
                  <div className="font-data text-xs text-text-muted uppercase tracking-wider">Dates</div>
                  <div className="font-body font-medium text-verde-800 text-sm">
                    {formatDateRange(searchParams.checkIn, searchParams.checkOut)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users size={16} className="text-verde-500 shrink-0" />
                <div>
                  <div className="font-data text-xs text-text-muted uppercase tracking-wider">Guests</div>
                  <div className="font-body font-medium text-verde-800 text-sm">
                    {formatGuestCount(searchParams.guests)}
                  </div>
                </div>
              </div>

              <div className="border-t border-verde-100 pt-4 space-y-2 text-sm font-body">
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
            </div>
          </div>

          <div className="bg-cream-50 rounded-2xl p-4 border border-verde-100">
            <h3 className="font-heading font-bold text-verde-800 text-sm mb-2">Guest Details</h3>
            <div className="text-sm font-body text-text-secondary space-y-1">
              <p>{guestDetails.firstName} {guestDetails.lastName}</p>
              <p>{guestDetails.email}</p>
              <p>{guestDetails.phone}</p>
            </div>
          </div>
        </div>

        {/* Right — Payment Form */}
        <div className="lg:col-span-3">
          <div className="bg-surface rounded-3xl border border-verde-100 shadow-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-verde-50 flex items-center justify-center">
                <CreditCard size={20} className="text-verde-500" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-verde-800">Payment</h2>
                <p className="text-text-muted text-xs font-body">Secure checkout powered by Stripe</p>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-verde-500 mb-4" />
                <p className="text-text-secondary font-body">Preparing your checkout...</p>
              </div>
            )}

            {initError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-body font-medium mb-4">{initError}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="text-verde-600 font-body font-semibold underline"
                >
                  Go back and try again
                </button>
              </div>
            )}

            {clientSecret && elementsOptions && (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm
                  clientSecret={clientSecret}
                  bookingId={bookingId}
                  confirmationCode={confirmationCode}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
