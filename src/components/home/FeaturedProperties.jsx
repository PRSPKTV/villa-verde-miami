import { useProperties } from '@/hooks/useProperties';
import PropertyCard from '@/components/properties/PropertyCard';
import Button from '@/components/ui/Button';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProperties() {
  const { properties, loading } = useProperties();

  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.featured-anim'), {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%' },
    });
  });

  if (loading || properties.length === 0) return null;

  return (
    <section ref={sectionRef} className="pt-32 md:pt-40 pb-24 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="featured-anim font-data text-xs uppercase tracking-[0.3em] text-gold-600 mb-3 block">
            Curated Stays
          </span>
          <h2 className="featured-anim font-heading text-3xl md:text-5xl font-bold text-verde-800">
            Our Properties
          </h2>
        </div>
        <div className="featured-anim">
          <Button to="/properties" variant="secondary" size="sm">
            View All <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {properties.map(property => (
          <div key={property.id} className="featured-anim">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </section>
  );
}
