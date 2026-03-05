import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-gold-500 text-verde-800 hover:scale-[1.03] active:scale-95 shadow-tropical',
  secondary: 'bg-transparent border-2 border-verde-500 text-verde-500 hover:bg-verde-500 hover:text-cream-100',
  ghost: 'bg-transparent text-verde-500 hover:bg-verde-50',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({ children, variant = 'primary', size = 'md', to, className = '', ...props }) {
  const classes = `relative overflow-hidden group rounded-full font-body font-semibold transition-transform duration-300 inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`;
  const style = { transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' };

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
      )}
    </>
  );

  if (to) {
    return <Link to={to} className={classes} style={style} {...props}>{inner}</Link>;
  }

  return <button className={classes} style={style} {...props}>{inner}</button>;
}
