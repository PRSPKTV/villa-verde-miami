import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { useSiteContent } from '@/hooks/useSiteContent';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function AboutSnippet() {
  const { content, loading } = useSiteContent('about_snippet');

  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.about-snippet-anim'), {
      y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%' },
    });
    const img = el.querySelector('.parallax-img');
    if (img) {
      gsap.to(img, {
        yPercent: 15, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  if (loading) return null;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="about-snippet-anim relative overflow-hidden rounded-3xl h-[400px] lg:h-[500px]">
          <img
            src={content?.image || "https://a0.muscache.com/im/pictures/1efb2a11-9b7a-41a7-b466-950e32f3dbad.jpg"}
            alt="Villa Verde"
            className="parallax-img w-full h-[120%] object-cover -translate-y-[10%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-verde-800/30 to-transparent" />
        </div>

        <div>
          <span className="about-snippet-anim font-data text-xs uppercase tracking-[0.3em] text-gold-600 mb-4 block">
            {content?.eyebrow || 'Our Philosophy'}
          </span>
          <h2 className="about-snippet-anim font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-6 leading-tight">
            {content?.heading || <>Where Tropical Elegance<br />Meets Authentic Little Havana</>}
          </h2>
          <p className="about-snippet-anim text-text-secondary font-body text-lg leading-relaxed mb-4">
            {content?.paragraphs?.[0] || 'Villa Verde began as a simple idea — to create a place in Miami where travelers could feel truly at home. Nestled in the heart of Little Havana, our properties blend the vibrant culture of the neighborhood with the comfort and style that every traveler deserves.'}
          </p>
          <p className="about-snippet-anim text-text-secondary font-body text-lg leading-relaxed mb-4">
            {content?.paragraphs?.[1] || 'What started as a single property has grown into a curated collection of vacation rentals, each thoughtfully designed to offer an authentic Miami experience. From the tropical gardens to the carefully chosen furnishings, every detail reflects our commitment to exceptional hospitality.'}
          </p>
          <div className="about-snippet-anim">
            <Button to="/about" variant="secondary">
              Our Story <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
