export function calculatePricing(pricing, nights) {
  if (!pricing || nights <= 0) {
    return { nightlyRate: 0, nights: 0, subtotal: 0, cleaningFee: 0, serviceFee: 0, taxes: 0, total: 0 };
  }

  const subtotal = pricing.nightlyRate * nights;
  const cleaningFee = pricing.cleaningFee;
  const serviceFee = Math.round(subtotal * pricing.serviceFeeRate);
  const taxableAmount = subtotal + cleaningFee + serviceFee;
  const taxes = Math.round(taxableAmount * pricing.taxRate);
  const total = subtotal + cleaningFee + serviceFee + taxes;

  return {
    nightlyRate: pricing.nightlyRate,
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total,
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
