import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.cta-anim'), {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });

    const img = el.querySelector('.cta-parallax');
    if (img) {
      gsap.to(img, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  });

  return (
    <section ref={sectionRef} className="relative py-32 md:py-40 px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://a0.muscache.com/im/pictures/37849b8f-1280-4936-9539-a448172b3c6b.jpg"
          alt="Villa Verde outdoor space"
          className="cta-parallax w-full h-[120%] object-cover -translate-y-[10%]"
        />
        <div className="absolute inset-0 bg-verde-900/70" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="cta-anim font-heading italic text-4xl md:text-6xl lg:text-7xl text-gold-500 mb-6 leading-[1.1]">
          Your Miami Oasis Awaits
        </h2>
        <p className="cta-anim text-cream-200/80 font-body text-xl mb-10 max-w-lg mx-auto">
          Experience the beauty of Little Havana from your own private tropical retreat.
        </p>
        <div className="cta-anim">
          <Button to="/properties" size="lg">
            Explore Properties <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
