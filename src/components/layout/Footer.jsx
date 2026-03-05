import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';

export default function Footer() {
  const footerRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.footer-anim'), {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });

  return (
    <footer ref={footerRef} className="bg-verde-600 text-cream-100 rounded-t-[3rem] px-6 md:px-12 py-16 md:py-24 relative z-20 mt-[-1rem]">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-16 lg:mb-20 footer-anim">
        <h2 className="font-heading italic text-4xl md:text-6xl lg:text-7xl text-gold-500 mb-6 text-center leading-[1.1]">
          Your Oasis Awaits
        </h2>
        <Link
          to="/properties"
          className="relative overflow-hidden group bg-gold-500 text-verde-800 px-8 py-4 rounded-full font-body font-bold text-lg transition-transform duration-300 hover:scale-[1.03] shadow-[0_0_40px_rgba(201,168,76,0.2)]"
          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Explore Properties
            <span className="font-data font-normal text-xs px-2 py-1 bg-verde-800/10 rounded-full">Miami</span>
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 border-t border-verde-400/20 pt-12 items-start footer-anim">
        <div className="md:col-span-2">
          <img
            src="https://villaverdemiami.com/wp-content/uploads/2025/03/WhatsApp_Image_2025-03-11_at_00.35.32_c1c8ffc1-removebg-preview.png"
            alt="Villa Verde logo"
            className="h-[270px] w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] -mt-4 mb-2"
          />
          <p className="font-body text-cream-200/70 max-w-sm mb-6">
            Little Havana's tranquil oasis. Luxury short-term rentals curated with tropical elegance in the heart of Miami.
          </p>
          <div className="flex flex-col gap-3 text-sm text-cream-200/70">
            <a href="tel:+13054400808" className="flex items-center gap-2 hover:text-gold-500 transition-colors">
              <Phone size={14} /> (305) 440-0808
            </a>
            <a href="mailto:jmordan57@gmail.com" className="flex items-center gap-2 hover:text-gold-500 transition-colors">
              <Mail size={14} /> jmordan57@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} /> 1718 SW 11 St, Miami, FL 33135
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 font-body text-sm font-medium">
          <div className="font-data text-xs uppercase tracking-widest text-gold-500 mb-1">Navigation</div>
          <Link to="/properties" className="text-cream-200/70 hover:text-gold-500 transition-colors">Properties</Link>
          <Link to="/about" className="text-cream-200/70 hover:text-gold-500 transition-colors">About Us</Link>
          <Link to="/faq" className="text-cream-200/70 hover:text-gold-500 transition-colors">FAQ</Link>
          <Link to="/contact" className="text-cream-200/70 hover:text-gold-500 transition-colors">Contact</Link>
        </div>

        <div className="flex flex-col gap-3 font-body text-sm font-medium">
          <div className="font-data text-xs uppercase tracking-widest text-gold-500 mb-1">Legal</div>
          <a href="#" className="text-cream-200/70 hover:text-gold-500 transition-colors">Privacy Policy</a>
          <a href="#" className="text-cream-200/70 hover:text-gold-500 transition-colors">Terms of Service</a>
          <a href="#" className="text-cream-200/70 hover:text-gold-500 transition-colors">Cancellation Policy</a>
          <div className="flex gap-4 mt-4">
            <a href="https://www.instagram.com/villaverdemiami/" target="_blank" rel="noopener noreferrer" className="text-cream-200/50 hover:text-gold-500 transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/share/14aq5WKrdB/" target="_blank" rel="noopener noreferrer" className="text-cream-200/50 hover:text-gold-500 transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-verde-400/10 text-center text-cream-200/40 text-xs font-data">
        &copy; {new Date().getFullYear()} Villa Verde Miami. All rights reserved.
      </div>
    </footer>
  );
}
