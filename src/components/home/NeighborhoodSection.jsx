import { useNeighborhood } from '@/hooks/useNeighborhood';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import * as LucideIcons from 'lucide-react';

export default function NeighborhoodSection() {
  const { neighborhood: neighborhoodHighlights, loading } = useNeighborhood();

  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.hood-anim'), {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%' },
    });
  });

  if (loading || neighborhoodHighlights.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="hood-anim font-data text-xs uppercase tracking-[0.3em] text-gold-600 mb-3 block">
          The Neighborhood
        </span>
        <h2 className="hood-anim font-heading text-3xl md:text-5xl font-bold text-verde-800 mb-4">
          Discover Little Havana
        </h2>
        <p className="hood-anim text-text-secondary font-body text-lg max-w-xl mx-auto">
          One of Miami's most vibrant and culturally rich neighborhoods — right outside your door.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {neighborhoodHighlights.map((item) => {
          const Icon = LucideIcons[item.icon] || LucideIcons.MapPin;
          return (
            <div
              key={item.name}
              className="hood-anim bg-surface rounded-2xl p-6 border border-verde-100 hover:shadow-tropical transition-shadow duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-verde-50 flex items-center justify-center shrink-0 group-hover:bg-verde-100 transition-colors">
                  <Icon size={20} className="text-verde-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-lg font-bold text-verde-800">{item.name}</h3>
                    <span className="font-data text-[10px] uppercase tracking-widest text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded-full">
                      {item.distance}
                    </span>
                  </div>
                  <p className="text-text-secondary font-body text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
