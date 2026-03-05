import Hero from '@/components/home/Hero';
import BookingSearchBar from '@/components/home/BookingSearchBar';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import AboutSnippet from '@/components/home/AboutSnippet';
import TestimonialCarousel from '@/components/home/TestimonialCarousel';
import NeighborhoodSection from '@/components/home/NeighborhoodSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Booking bar overlaps hero by pulling upward with negative margin */}
      <div className="animate-search-bar relative z-30 -mt-8 md:-mt-10 px-4 md:px-8 mb-4">
        <BookingSearchBar />
      </div>
      <FeaturedProperties />
      <AboutSnippet />
      <TestimonialCarousel />
      <NeighborhoodSection />
      <CTASection />
    </>
  );
}
