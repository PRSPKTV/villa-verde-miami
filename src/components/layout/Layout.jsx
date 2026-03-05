import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NoiseOverlay from './NoiseOverlay';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  return (
    <div className="bg-background min-h-screen text-text-primary selection:bg-verde-400 selection:text-white overflow-hidden">
      <NoiseOverlay />
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
