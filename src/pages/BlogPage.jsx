import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { PenLine, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const previewPosts = [
  {
    title: 'The Ultimate Guide to Little Havana',
    excerpt: 'Discover the hidden gems, best restaurants, and cultural experiences that make Little Havana one of Miami\'s most beloved neighborhoods.',
    category: 'Neighborhood',
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-798758485935620006/original/9280c950-e46f-439e-8c19-8026b2a963a8.jpeg',
  },
  {
    title: 'Top 10 Things to Do Near Villa Verde',
    excerpt: 'From Calle Ocho\'s vibrant art scene to the best Cuban coffee spots, here are our top picks for things to do during your stay.',
    category: 'Travel Tips',
    image: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1566697701396201957/original/88f932c3-e9ce-4acf-a731-afc61c7dd5aa.jpeg',
  },
  {
    title: 'Why Direct Booking Saves You Money',
    excerpt: 'Learn how booking directly with Villa Verde gives you better rates, more flexibility, and a personalized guest experience.',
    category: 'Booking',
    image: 'https://a0.muscache.com/im/pictures/miso/Hosting-1127519896882361213/original/ef4d879b-1c20-4ad8-b686-4dacc4ffcf5c.jpeg',
  },
];

export default function BlogPage() {
  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.blog-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2,
    });
  });

  const gridRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.blog-card'), {
      y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  return (
    <div className="pt-28 pb-20 px-4 md:px-8">
      <div ref={heroRef} className="max-w-4xl mx-auto mb-16 text-center">
        <div className="blog-anim inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-1.5 rounded-full font-data text-xs uppercase tracking-widest mb-6">
          <PenLine size={12} /> Coming Soon
        </div>
        <h1 className="blog-anim font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-4">
          The Villa Verde Blog
        </h1>
        <p className="blog-anim text-text-secondary font-body text-lg max-w-2xl mx-auto">
          Stories, guides, and insider tips for experiencing the best of Little Havana and Miami.
        </p>
      </div>

      <div ref={gridRef} className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
        {previewPosts.map(post => (
          <div key={post.title} className="blog-card group bg-surface rounded-3xl border border-verde-100 overflow-hidden shadow-card opacity-80">
            <div className="relative h-48 overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-3 left-3 bg-verde-500/90 backdrop-blur-sm text-cream-100 px-3 py-1 rounded-full font-data text-[10px] uppercase tracking-wider">
                {post.category}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-heading text-lg font-bold text-verde-800 mb-2">{post.title}</h3>
              <p className="text-text-secondary font-body text-sm leading-relaxed">{post.excerpt}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center bg-verde-50 rounded-3xl p-10 border border-verde-100">
        <h2 className="font-heading text-2xl font-bold text-verde-800 mb-3">Stay in the Loop</h2>
        <p className="text-text-secondary font-body mb-6">
          Be the first to know when our blog launches with travel guides, neighborhood tips, and exclusive offers.
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-xl border border-verde-200 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
          />
          <button className="bg-gold-500 text-verde-800 px-6 py-3 rounded-xl font-body font-semibold flex items-center gap-2 hover:bg-gold-400 transition-colors shrink-0">
            Notify Me <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
