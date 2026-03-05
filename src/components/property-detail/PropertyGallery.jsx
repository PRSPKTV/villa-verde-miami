import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertyGallery({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-h-[70vh] flex items-center justify-center mb-4">
        <img
          src={images[current].url}
          alt={images[current].alt}
          className="max-w-full max-h-[70vh] object-contain rounded-2xl"
        />

        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-cream-100/20 hover:bg-cream-100/40 text-cream-100 rounded-full p-2 backdrop-blur-sm transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-cream-100/20 hover:bg-cream-100/40 text-cream-100 rounded-full p-2 backdrop-blur-sm transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 right-4 bg-verde-900/70 text-cream-100 px-3 py-1 rounded-full font-data text-sm backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === current ? 'border-gold-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
            }`}
          >
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
