import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { blogPosts } from '@/data/blog';
import { format, parseISO } from 'date-fns';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.slug === slug);

  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.post-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.2,
    });
  });

  if (!post) {
    return (
      <div className="pt-28 pb-20 px-4 md:px-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-verde-800 mb-4">Post Not Found</h1>
        <p className="text-text-secondary font-body mb-6">This blog post doesn't exist.</p>
        <Link to="/blog" className="text-verde-600 font-body font-semibold underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="pt-28 pb-20 px-4 md:px-8">
      <div ref={heroRef} className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/blog')}
          className="post-anim flex items-center gap-2 text-verde-600 font-body font-medium mb-8 hover:text-verde-800 transition-colors"
        >
          <ArrowLeft size={18} />
          All Posts
        </button>

        <div className="post-anim flex items-center gap-4 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-verde-500/10 text-verde-700 px-3 py-1 rounded-full font-data text-xs uppercase tracking-wider">
            <Tag size={10} /> {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-text-muted font-data text-xs">
            <Calendar size={12} /> {format(parseISO(post.date), 'MMMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1.5 text-text-muted font-data text-xs">
            <Clock size={12} /> {post.readTime}
          </span>
        </div>

        <h1 className="post-anim font-heading text-3xl md:text-5xl font-bold text-verde-800 mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="post-anim text-text-secondary font-body text-lg mb-8 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="post-anim rounded-3xl overflow-hidden mb-10 shadow-card">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>

        <div className="post-anim prose-verde">
          {post.content.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={i}
                  className="font-heading text-xl md:text-2xl font-bold text-verde-800 mt-10 mb-4 first:mt-0"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <p
                key={i}
                className="text-text-secondary font-body text-base leading-relaxed mb-5"
              >
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-verde-100">
          <h3 className="font-heading text-lg font-bold text-verde-800 mb-6">More from the Blog</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts
              .filter(p => p.slug !== post.slug)
              .slice(0, 2)
              .map(related => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  className="group flex gap-4 bg-cream-50 rounded-2xl border border-verde-100 p-4 hover:shadow-card transition-all"
                >
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <span className="text-verde-500 font-data text-[10px] uppercase tracking-wider">
                      {related.category}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-verde-800 group-hover:text-verde-600 transition-colors leading-snug">
                      {related.title}
                    </h4>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </article>
  );
}
