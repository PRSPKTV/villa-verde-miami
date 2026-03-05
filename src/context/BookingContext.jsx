import { createContext, useContext, useState, useCallback } from 'react';
import { calculatePricing } from '@/utils/priceUtils';
import { getNumberOfNights } from '@/utils/dateUtils';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [searchParams, setSearchParams] = useState({
    checkIn: null,
    checkOut: null,
    guests: 2,
  });

  const [selectedProperty, setSelectedProperty] = useState(null);

  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [pricing, setPricing] = useState(null);

  const [paymentState, setPaymentState] = useState({ status: 'idle', error: null });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const updateSearchParams = useCallback((params) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  }, []);

  const updateGuestDetails = useCallback((details) => {
    setGuestDetails(prev => ({ ...prev, ...details }));
  }, []);

  const computePricing = useCallback((propertyPricing, checkIn, checkOut) => {
    const nights = getNumberOfNights(checkIn, checkOut);
    const result = calculatePricing(propertyPricing, nights);
    setPricing(result);
    return result;
  }, []);

  const resetBooking = useCallback(() => {
    setSearchParams({ checkIn: null, checkOut: null, guests: 2 });
    setSelectedProperty(null);
    setGuestDetails({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });
    setPricing(null);
    setPaymentState({ status: 'idle', error: null });
    setConfirmedBooking(null);
  }, []);

  return (
    <BookingContext.Provider value={{
      searchParams, updateSearchParams,
      selectedProperty, setSelectedProperty,
      guestDetails, updateGuestDetails,
      pricing, computePricing,
      paymentState, setPaymentState,
      confirmedBooking, setConfirmedBooking,
      resetBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}
