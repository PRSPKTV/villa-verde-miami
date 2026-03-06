import { useSiteContent } from '@/hooks/useSiteContent';

const defaultData = {
  eyebrow: 'Little Havana, Miami',
  heading: ['Welcome to', 'Villa Verde'],
  subtitle: 'Your tranquil oasis in the heart of Miami. Luxury short-term rentals curated with tropical elegance.',
  stats: [
    { value: '5.0', label: 'Rating' },
    { value: '4', label: 'Properties' },
    { value: '24/7', label: 'Support' },
  ],
  backgroundImage: 'https://a0.muscache.com/im/pictures/miso/Hosting-924140366096705315/original/a136a51b-f212-424e-9c29-d5bb1c5f21fc.jpeg',
};

export default function Hero() {
  const { content } = useSiteContent('hero');

  const eyebrow = content?.eyebrow || defaultData.eyebrow;
  const heading = content?.heading || defaultData.heading;
  const subtitle = content?.subtitle || defaultData.subtitle;
  const stats = content?.stats || defaultData.stats;
  const backgroundImage = content?.backgroundImage || defaultData.backgroundImage;

  return (
    <section className="relative w-full h-[100dvh] min-h-[700px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Villa Verde"
          className="animate-scale-in w-full h-full object-cover origin-center"
        />
        <div className="absolute inset-0 bg-verde-900/30" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 md:px-8">
        <h1 className="flex flex-col items-center gap-2 mb-5">
          <span className="animate-fade-up text-2xl md:text-3xl lg:text-4xl font-medium tracking-wide text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {heading[0]}
          </span>
          <span className="animate-fade-up text-5xl md:text-7xl lg:text-[7rem] font-bold leading-[0.95] text-[#C9A84C]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {heading[1]}
          </span>
        </h1>

        <p className="animate-fade-up text-white/80 font-body text-sm md:text-base max-w-lg mb-2 font-normal tracking-wide">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
