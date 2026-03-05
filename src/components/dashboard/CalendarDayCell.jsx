import { format, isToday } from 'date-fns';

export default function CalendarDayCell({ day, isPast, blocked, booked, booking, customPricing, basePrice, isInSelection, isSelected, onClick }) {
  const priceDisplay = customPricing?.custom_price
    ? `$${(customPricing.custom_price / 100).toFixed(0)}`
    : basePrice
      ? `$${(basePrice / 100).toFixed(0)}`
      : null;

  const hasCustomPrice = !!customPricing?.custom_price;
  const hasMinStay = customPricing?.minimum_stay > 0;
  const today = isToday(day);

  let bgClass = 'hover:bg-verde-50';
  let textClass = 'text-verde-800';

  if (isPast) { bgClass = ''; textClass = 'text-text-muted/30 cursor-not-allowed'; }
  else if (isInSelection) { bgClass = 'bg-blue-100 ring-2 ring-blue-300'; textClass = 'text-blue-800'; }
  else if (isSelected) { bgClass = 'bg-verde-500'; textClass = 'text-cream-100'; }
  else if (booked) { bgClass = 'bg-gold-100 cursor-not-allowed'; textClass = 'text-gold-800'; }
  else if (blocked) { bgClass = 'bg-red-50 hover:bg-red-100'; textClass = 'text-red-700'; }
  else if (hasCustomPrice) { bgClass = 'bg-verde-50 hover:bg-verde-100'; textClass = 'text-verde-800'; }

  return (
    <button
      onClick={() => onClick(day)}
      disabled={isPast}
      title={booked ? `${booking?.guest_first_name} ${booking?.guest_last_name}` : blocked ? 'Blocked' : 'Available'}
      className={`h-20 rounded-lg text-sm font-body flex flex-col items-center justify-center transition-all relative p-1 ${bgClass} ${textClass} ${today ? 'ring-2 ring-verde-400' : ''}`}
    >
      <span className="font-data text-sm font-semibold">{format(day, 'd')}</span>

      {booked && <span className="text-[9px] font-data font-semibold text-gold-700 mt-0.5">Booked</span>}
      {blocked && !booked && <span className="text-[9px] font-data font-semibold text-red-600 mt-0.5">Blocked</span>}

      {priceDisplay && !booked && (
        <span className={`text-[10px] font-data mt-0.5 ${hasCustomPrice && !blocked ? 'text-verde-600 font-bold' : 'text-text-muted'}`}>
          {priceDisplay}
        </span>
      )}

      {hasMinStay && !booked && !blocked && (
        <span className="text-[8px] font-data text-text-muted">{customPricing.minimum_stay}n min</span>
      )}

      {customPricing?.notes && !booked && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold-500" title={customPricing.notes} />
      )}
    </button>
  );
}
