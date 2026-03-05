import { faqData } from '@/data/faq';
import Accordion from '@/components/ui/Accordion';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';

export default function FAQPage() {
  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.faq-hero-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2,
    });
  });

  return (
    <div className="pt-28 pb-20">
      <section ref={heroRef} className="px-4 md:px-8 max-w-4xl mx-auto mb-16">
        <h1 className="faq-hero-anim font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="faq-hero-anim text-text-secondary font-body text-lg">
          Everything you need to know about staying with Villa Verde Miami.
        </p>
      </section>

      <div className="px-4 md:px-8 max-w-4xl mx-auto">
        {faqData.map((group) => (
          <div key={group.category} className="mb-12">
            <h2 className="font-heading text-2xl font-bold text-verde-700 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gold-500 rounded-full" />
              {group.category}
            </h2>
            <div className="bg-surface rounded-2xl border border-verde-100 px-6">
              {group.items.map((item, i) => (
                <Accordion key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
