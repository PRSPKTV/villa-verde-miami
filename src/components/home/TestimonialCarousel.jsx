import { useState, useEffect } from 'react';
import { testimonials } from '@/data/testimonials';
import StarRating from '@/components/ui/StarRating';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.testimonial-anim'), {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  const t = testimonials[current];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-verde-50 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <span className="testimonial-anim font-data text-xs uppercase tracking-[0.3em] text-gold-600 mb-3 block">
          Guest Experiences
        </span>
        <h2 className="testimonial-anim font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-16">
          What Our Guests Say
        </h2>

        <div className="testimonial-anim relative">
          <Quote size={48} className="text-verde-200 mx-auto mb-6" />

          <div className="min-h-[160px] flex items-center justify-center">
            <p className="font-body text-xl md:text-2xl text-verde-700 leading-relaxed max-w-2xl italic transition-opacity duration-500">
              "{t.text}"
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2">
            <StarRating rating={t.rating} size={16} />
            <span className="font-heading text-lg font-bold text-verde-800">{t.name}</span>
            <span className="font-body text-sm text-text-muted">
              {t.location} — {t.property}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full border border-verde-200 text-verde-500 hover:bg-verde-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-gold-500 w-6' : 'bg-verde-200'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrent((current + 1) % testimonials.length)}
              className="p-2 rounded-full border border-verde-200 text-verde-500 hover:bg-verde-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
