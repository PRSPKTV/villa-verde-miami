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
]);
