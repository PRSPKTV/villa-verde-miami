export default function Hero() {
  return (
    <section className="relative w-full h-[100dvh] min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://a0.muscache.com/im/pictures/miso/Hosting-924140366096705315/original/a136a51b-f212-424e-9c29-d5bb1c5f21fc.jpeg"
          alt="Villa Verde exterior in Little Havana"
          className="animate-scale-in w-full h-full object-cover origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-verde-900/90 via-verde-900/40 to-verde-900/20" />
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 md:px-8 pb-24 md:pb-32">
        <span className="animate-fade-up font-data text-xs md:text-sm uppercase tracking-[0.3em] text-gold-500 mb-4">
          Little Havana, Miami
        </span>

        <h1 className="flex flex-col items-center gap-1 mb-6">
          <span className="animate-fade-up font-heading font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight text-cream-100">
            Welcome to
          </span>
          <span className="animate-fade-up font-heading italic text-5xl md:text-7xl lg:text-[8rem] leading-[0.9] text-gold-500">
            Villa Verde
          </span>
        </h1>

        <p className="animate-fade-up text-cream-200/80 font-body text-base md:text-lg max-w-xl mb-2 font-medium">
          Your tranquil oasis in the heart of Miami. Luxury short-term rentals curated with tropical elegance.
        </p>

      </div>
    </section>
  );
}
