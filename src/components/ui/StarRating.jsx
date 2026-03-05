import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 14, className = '' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} size={size} className="fill-gold-500 text-gold-500" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <div key={i} className="relative" style={{ width: size, height: size }}>
          <Star size={size} className="text-cream-300 absolute" />
          <div className="overflow-hidden absolute" style={{ width: size / 2 }}>
            <Star size={size} className="fill-gold-500 text-gold-500" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} size={size} className="text-cream-300" />);
    }
  }

  return <div className={`flex items-center gap-0.5 ${className}`}>{stars}</div>;
}
