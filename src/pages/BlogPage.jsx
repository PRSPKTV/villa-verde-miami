import { PenLine, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts } from '@/data/blog';
import { format, parseISO } from 'date-fns';

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-verde-50 text-verde-700 px-4 py-1.5 rounded-full font-data text-xs uppercase tracking-widest mb-6">
          <PenLine size={12} /> Stories & Guides
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-4">
          The Villa Verde Blog
        </h1>
        <p className="text-text-secondary font-body text-lg max-w-2xl mx-auto">
          Stories, guides, and insider tips for experiencing the best of Little Havana and Miami.
        </p>
      </div>

      {/* Featured Post */}
      <Link
        to={`/blog/${featured.slug}`}
        className="block max-w-6xl mx-auto mb-12 group"
      >
        <div className="bg-surface rounded-3xl border border-verde-100 overflow-hidden shadow-card md:flex">
          <div className="relative md:w-1/2 h-64 md:h-auto overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-gold-500 text-verde-800 px-3 py-1 rounded-full font-data text-[10px] uppercase tracking-wider font-bold">
              Featured
            </div>
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 text-verde-500 font-data text-xs uppercase tracking-wider mb-3">
              {featured.category}
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-verde-800 mb-3 group-hover:text-verde-600 transition-colors">
              {featured.title}
            </h2>
            <p className="text-text-secondary font-body text-base leading-relaxed mb-4">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-4 text-text-muted font-data text-xs">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} /> {format(parseISO(featured.date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {featured.readTime}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Post Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
        {rest.map(post => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group bg-surface rounded-3xl border border-verde-100 overflow-hidden shadow-card hover:shadow-elevated transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-3 left-3 bg-verde-500/90 backdrop-blur-sm text-cream-100 px-3 py-1 rounded-full font-data text-[10px] uppercase tracking-wider">
                {post.category}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-heading text-lg font-bold text-verde-800 mb-2 group-hover:text-verde-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-text-secondary font-body text-sm leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-text-muted font-data text-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} /> {format(parseISO(post.date), 'MMM d')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={11} /> {post.readTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter */}
      <div className="max-w-2xl mx-auto text-center bg-verde-50 rounded-3xl p-10 border border-verde-100">
        <h2 className="font-heading text-2xl font-bold text-verde-800 mb-3">Stay in the Loop</h2>
        <p className="text-text-secondary font-body mb-6">
          Get travel guides, neighborhood tips, and exclusive offers delivered to your inbox.
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-xl border border-verde-200 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
          />
          <button className="bg-gold-500 text-verde-800 px-6 py-3 rounded-xl font-body font-semibold flex items-center gap-2 hover:bg-gold-400 transition-colors shrink-0">
            Subscribe <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
