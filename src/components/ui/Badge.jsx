const variants = {
  success: 'bg-verde-100 text-verde-500',
  gold: 'bg-gold-500/10 text-gold-700',
  neutral: 'bg-cream-200 text-text-secondary',
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-data font-medium tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
