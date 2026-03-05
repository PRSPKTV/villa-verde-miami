import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import Button from '@/components/ui/Button';
import { Leaf, Heart, Star } from 'lucide-react';

export default function AboutPage() {
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

  return (
    <div>
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://a0.muscache.com/im/pictures/miso/Hosting-924140366096705315/original/a136a51b-f212-424e-9c29-d5bb1c5f21fc.jpeg"
            alt="Villa Verde exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-verde-800/80 via-verde-800/70 to-background" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center py-16">
          <h1 className="about-anim font-heading italic text-5xl md:text-7xl font-bold text-cream-100 mb-6">
            Welcome to Your<br />Miami Retreat
          </h1>
          <p className="about-anim text-cream-200/80 font-body text-xl max-w-2xl mx-auto">
            Your home away from home in the heart of Miami — where comfort, style, and convenience come together.
          </p>
        </div>
      </section>

      <section ref={storyRef} className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="story-anim font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-6">
              Our Story
            </h2>
            <p className="story-anim text-text-secondary font-body leading-relaxed mb-4">
              Villa Verde was founded by Jonnathan out of a genuine passion for hospitality and a love for Miami's vibrant Little Havana neighborhood. What started as a vision to create the perfect guest experience has grown into a collection of thoughtfully curated properties that blend comfort, style, and convenience.
            </p>
            <p className="story-anim text-text-secondary font-body leading-relaxed mb-4">
              Every detail has been curated with care — from the fully equipped kitchens to the stylish living spaces. Our properties offer a seamless blend of modern amenities and tropical character, designed to make every guest feel right at home.
            </p>
            <p className="story-anim text-text-secondary font-body leading-relaxed mb-8">
              Step outside and immerse yourself in the vibrant culture of Little Havana, one of Miami's most beloved neighborhoods. Whether you're here for business, leisure, or a special occasion, Villa Verde delivers a personalized and exceptional guest experience.
            </p>
            <div className="story-anim">
              <Button to="/properties">Explore Our Properties</Button>
            </div>
          </div>
          <div className="story-anim relative">
            <img
              src="https://a0.muscache.com/im/pictures/miso/Hosting-924140366096705315/original/a136a51b-f212-424e-9c29-d5bb1c5f21fc.jpeg"
              alt="Villa Verde front exterior"
              className="rounded-3xl shadow-elevated w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-gold-500 text-verde-800 px-6 py-4 rounded-2xl shadow-tropical">
              <span className="font-data text-2xl font-bold">5.0</span>
              <span className="font-body text-sm ml-2">avg rating</span>
            </div>
          </div>
        </div>
      </section>

      <section ref={valuesRef} className="py-20 px-4 md:px-8 bg-verde-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-12 text-center">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: 'Prime Location', desc: 'Located in the heart of Little Havana, minutes from Calle Ocho, Mary Brickell Village, and Miami\'s best dining and nightlife.' },
              { icon: Heart, title: 'Guest-Centric Approach', desc: 'We respond within an hour and go the extra mile — from accommodating special requests to delivering umbrellas in the rain.' },
              { icon: Star, title: 'Five-Star Experience', desc: 'A perfect 5.0 rating across all guest reviews. Every stay is curated with comfort, connection, and care at the forefront.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="value-card bg-surface rounded-3xl p-8 shadow-card border border-verde-100">
                <div className="w-12 h-12 rounded-2xl bg-verde-100 flex items-center justify-center mb-5">
                  <Icon size={24} className="text-verde-500" />
                </div>
                <h3 className="font-heading text-xl font-bold text-verde-800 mb-3">{title}</h3>
                <p className="text-text-secondary font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
