import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { useSiteContent } from '@/hooks/useSiteContent';
import Button from '@/components/ui/Button';
import { Leaf, Heart, Star, Loader2 } from 'lucide-react';

const defaultValues = [
  { title: 'Tropical Comfort', description: 'Every property is designed as a tranquil oasis with tropical touches throughout.', icon: Leaf },
  { title: 'Personal Touch', description: "We're not a faceless corporation. We personally ensure every guest has an exceptional experience.", icon: Heart },
  { title: 'Five-Star Standards', description: 'With a 5.0 average rating, we hold ourselves to the highest standards of hospitality.', icon: Star },
];

const iconMap = { Leaf, Heart, Star };

export default function AboutPage() {
  const { content, loading } = useSiteContent('about');

  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.about-anim'), {
      y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2,
    });
  });

  const storyRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.story-anim'), {
      y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%' },
    });
  });

  const valuesRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.value-card'), {
      y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 75%' },
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-verde-500" />
      </div>
    );
  }

  const storyParagraphs = content?.storyParagraphs || [
    'Villa Verde began as a simple idea — to create a place in Miami where travelers could feel truly at home. Nestled in the heart of Little Havana, our properties blend the vibrant culture of the neighborhood with the comfort and style that every traveler deserves.',
    'What started as a single property has grown into a curated collection of vacation rentals, each thoughtfully designed to offer an authentic Miami experience. From the tropical gardens to the carefully chosen furnishings, every detail reflects our commitment to exceptional hospitality.',
    "We believe that where you stay shapes your entire trip. That's why we don't just offer a place to sleep — we create experiences. Our personalized guest communication, local recommendations, and attention to detail ensure that every stay at Villa Verde is memorable.",
  ];

  const values = content?.values || defaultValues;

  return (
    <div>
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://a0.muscache.com/im/pictures/miso/Hosting-924140366096705315/original/a136a51b-f212-424e-9c29-d5bb1c5f21fc.jpeg" alt="About" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-verde-800/80 via-verde-800/70 to-background" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center py-16">
          <h1 className="about-anim font-heading italic text-5xl md:text-7xl font-bold text-cream-100 mb-6">
            {content?.heroHeading || 'Welcome to Your Miami Retreat'}
          </h1>
          <p className="about-anim text-cream-200/80 font-body text-xl max-w-2xl mx-auto">
            {content?.heroSubtitle || 'Villa Verde began as a simple idea — to create a place in Miami where travelers could feel truly at home. Nestled in the...'}
          </p>
        </div>
      </section>

      <section ref={storyRef} className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="story-anim font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-6">
              {content?.storyTitle || 'Our Story'}
            </h2>
            {storyParagraphs.map((paragraph, idx) => (
              <p key={idx} className="story-anim font-body text-lg text-text-secondary leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="story-anim rounded-3xl overflow-hidden h-[400px]">
            <img src="https://a0.muscache.com/im/pictures/miso/Hosting-924140366096705315/original/a136a51b-f212-424e-9c29-d5bb1c5f21fc.jpeg" alt="Our story" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section ref={valuesRef} className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-verde-800 text-center mb-12">
          {content?.valuesTitle || 'What We Stand For'}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((val, idx) => {
            const IconComponent = iconMap[val.icon] || defaultValues[idx]?.icon || Star;
            return (
              <div key={idx} className="value-card bg-cream-200 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-verde-500 text-cream-100 flex items-center justify-center mx-auto mb-6">
                  <IconComponent size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-verde-800 mb-3">{val.title}</h3>
                <p className="font-body text-text-secondary">{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
