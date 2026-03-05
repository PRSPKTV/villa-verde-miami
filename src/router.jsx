import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import PropertiesPage from '@/pages/PropertiesPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import AboutPage from '@/pages/AboutPage';
import FAQPage from '@/pages/FAQPage';
import ContactPage from '@/pages/ContactPage';
import BookingConfirmationPage from '@/pages/BookingConfirmationPage';
import CheckoutPage from '@/pages/CheckoutPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LegalPage from '@/pages/LegalPage';
import MyBookingsPage from '@/pages/MyBookingsPage';

// Lazy-loaded dashboard pages
const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage'));
const PropertyListPage = lazy(() => import('@/pages/dashboard/PropertyListPage'));
const PropertyEditPage = lazy(() => import('@/pages/dashboard/PropertyEditPage'));
const CalendarManagementPage = lazy(() => import('@/pages/dashboard/CalendarManagementPage'));
const BookingsManagementPage = lazy(() => import('@/pages/dashboard/BookingsManagementPage'));
const ContentManagementPage = lazy(() => import('@/pages/dashboard/ContentManagementPage'));
const BlogEditorPage = lazy(() => import('@/pages/dashboard/BlogEditorPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));

function DashboardFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'properties/:slug', element: <PropertyDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },
      { path: 'legal/:type', element: <LegalPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'my-bookings', element: <MyBookingsPage /> },
      { path: 'booking/checkout', element: <CheckoutPage /> },
      { path: 'booking/confirmation', element: <BookingConfirmationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<DashboardFallback />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Suspense fallback={<DashboardFallback />}><DashboardOverviewPage /></Suspense> },
      { path: 'properties', element: <Suspense fallback={<DashboardFallback />}><PropertyListPage /></Suspense> },
      { path: 'properties/new', element: <Suspense fallback={<DashboardFallback />}><PropertyEditPage /></Suspense> },
      { path: 'properties/:id', element: <Suspense fallback={<DashboardFallback />}><PropertyEditPage /></Suspense> },
      { path: 'calendar', element: <Suspense fallback={<DashboardFallback />}><CalendarManagementPage /></Suspense> },
      { path: 'bookings', element: <Suspense fallback={<DashboardFallback />}><BookingsManagementPage /></Suspense> },
      { path: 'content', element: <Suspense fallback={<DashboardFallback />}><ContentManagementPage /></Suspense> },
      { path: 'content/blog/:id', element: <Suspense fallback={<DashboardFallback />}><BlogEditorPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<DashboardFallback />}><SettingsPage /></Suspense> },
    ],
  },
]);
