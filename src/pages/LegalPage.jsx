import { useParams, Link } from 'react-router-dom';
import { Shield, FileText, Ban, Home } from 'lucide-react';

const legalContent = {
  'privacy-policy': {
    icon: Shield,
    title: 'Privacy Policy',
    updated: 'March 1, 2026',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'When you book a stay or contact us, we collect personal information including your name, email address, phone number, and payment details. We also collect usage data such as pages visited and time spent on our site through standard analytics tools.',
      },
      {
        heading: 'How We Use Your Information',
        body: 'We use your information to process bookings and payments, communicate about your reservation, send booking confirmations, respond to inquiries, and improve our services. We may also send occasional updates about Villa Verde Miami if you have opted in.',
      },
      {
        heading: 'Payment Processing',
        body: 'All payments are processed securely through Stripe. We do not store your full credit card number on our servers. Stripe handles all payment data in compliance with PCI-DSS standards.',
      },
      {
        heading: 'Data Sharing',
        body: 'We do not sell or rent your personal information to third parties. We may share your data with service providers who assist in operating our website (such as payment processors and email services), but only as necessary to fulfill our services to you.',
      },
      {
        heading: 'Cookies',
        body: 'Our website uses cookies and similar technologies to enhance your browsing experience and analyze site traffic. You can control cookie preferences through your browser settings.',
      },
      {
        heading: 'Your Rights',
        body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us at jmordan57@gmail.com. We will respond to your request within 30 days.',
      },
      {
        heading: 'Contact',
        body: 'For privacy-related questions, contact us at jmordan57@gmail.com or call (305) 440-0808.',
      },
    ],
  },
  'terms-of-service': {
    icon: FileText,
    title: 'Terms of Service',
    updated: 'March 1, 2026',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: 'By accessing or using the Villa Verde Miami website and booking our properties, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
      },
      {
        heading: 'Booking & Reservations',
        body: 'All bookings are subject to availability. A reservation is confirmed only after full payment is processed. You will receive a confirmation email with your booking details and confirmation code.',
      },
      {
        heading: 'Guest Responsibilities',
        body: 'Guests are responsible for maintaining the property in good condition during their stay. Any damages beyond normal wear and tear may result in charges to the payment method on file. Guests must comply with all house rules provided at the time of booking.',
      },
      {
        heading: 'Check-in & Check-out',
        body: 'Standard check-in time is 4:00 PM and check-out time is 11:00 AM. Early check-in or late check-out may be available upon request and is subject to availability.',
      },
      {
        heading: 'Liability',
        body: 'Villa Verde Miami is not liable for any loss, damage, or injury to guests or their belongings during their stay. Guests are encouraged to obtain travel insurance for their trip.',
      },
      {
        heading: 'Modifications',
        body: 'We reserve the right to update these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the new terms.',
      },
      {
        heading: 'Governing Law',
        body: 'These terms are governed by the laws of the State of Florida. Any disputes shall be resolved in the courts of Miami-Dade County, Florida.',
      },
    ],
  },
  'cancellation-policy': {
    icon: Ban,
    title: 'Cancellation Policy',
    updated: 'March 1, 2026',
    sections: [
      {
        heading: 'Free Cancellation',
        body: 'Guests may cancel their reservation free of charge up to 7 days before the scheduled check-in date. A full refund will be issued to the original payment method within 5–10 business days.',
      },
      {
        heading: 'Late Cancellation (Within 7 Days)',
        body: 'Cancellations made within 7 days of check-in will incur a charge equal to the first night\'s stay. The remaining balance will be refunded.',
      },
      {
        heading: 'No-Show',
        body: 'If a guest does not arrive on the scheduled check-in date without prior notice, the full booking amount will be charged and no refund will be issued.',
      },
      {
        heading: 'Early Departure',
        body: 'If a guest checks out before the scheduled check-out date, no refund will be provided for unused nights.',
      },
      {
        heading: 'Modifications',
        body: 'Booking modifications (date changes, guest count changes) are subject to availability and may result in price adjustments. Please contact us at least 48 hours before check-in to request changes.',
      },
      {
        heading: 'Extenuating Circumstances',
        body: 'In cases of documented emergencies, natural disasters, or government-mandated travel restrictions, we will work with guests on a case-by-case basis to offer credit or rescheduling options.',
      },
      {
        heading: 'How to Cancel',
        body: 'To cancel or modify a reservation, email us at jmordan57@gmail.com or call (305) 440-0808 with your confirmation code.',
      },
    ],
  },
  'house-rules': {
    icon: Home,
    title: 'House Rules',
    updated: 'March 1, 2026',
    sections: [
      {
        heading: 'Check-in & Check-out',
        body: 'Check-in is at 4:00 PM. Check-out is at 11:00 AM. Self check-in instructions will be provided via email before your arrival. Early check-in and late check-out may be available upon request.',
      },
      {
        heading: 'Quiet Hours',
        body: 'Please observe quiet hours from 10:00 PM to 8:00 AM out of respect for our neighbors. Music and loud conversations should be kept indoors during these hours.',
      },
      {
        heading: 'No Smoking',
        body: 'All Villa Verde properties are strictly non-smoking. This includes cigarettes, vapes, and any other smoking devices. Smoking is permitted in designated outdoor areas only. A $250 cleaning fee will be charged for any violation.',
      },
      {
        heading: 'No Parties or Events',
        body: 'Our properties are not available for parties, events, or gatherings beyond the registered number of guests. Unauthorized gatherings may result in immediate termination of the reservation without refund.',
      },
      {
        heading: 'Pets',
        body: 'Pets are not permitted at any Villa Verde property unless otherwise stated in the listing. Service animals are welcome with proper documentation.',
      },
      {
        heading: 'Maximum Occupancy',
        body: 'The number of guests must not exceed the maximum occupancy listed for the property. Only registered guests are allowed to stay overnight.',
      },
      {
        heading: 'Parking',
        body: 'Free on-site parking is available. Please park only in designated spaces. Street parking is also available in the surrounding neighborhood.',
      },
      {
        heading: 'Kitchen & Appliances',
        body: 'All kitchens are fully equipped for your use. Please clean dishes and appliances after use. Do not leave the stove or oven unattended while in use.',
      },
      {
        heading: 'Pool & Outdoor Areas',
        body: 'Where applicable, pool hours are from 8:00 AM to 10:00 PM. No glass containers near the pool area. Children must be supervised at all times. Please rinse off before entering the pool.',
      },
      {
        heading: 'Trash & Recycling',
        body: 'Please dispose of trash in the bins provided. Recycling bins are available for glass, plastic, and paper. Trash pickup days and instructions are posted in the property guide.',
      },
      {
        heading: 'Lockout Policy',
        body: 'All properties use keyless entry with a unique code provided at check-in. If you are locked out, contact us and we will assist you promptly. There is no lockout fee.',
      },
      {
        heading: 'Damages & Lost Items',
        body: 'Please report any damages or maintenance issues immediately. Guests are responsible for damages beyond normal wear and tear. Lost items will be held for 14 days — contact us to arrange return shipping.',
      },
    ],
  },
};

export default function LegalPage() {
  const { type } = useParams();
  const content = legalContent[type];

  if (!content) {
    return (
      <div className="pt-28 pb-20 px-4 md:px-8 max-w-4xl mx-auto text-center">
        <h1 className="font-heading text-4xl font-bold text-verde-800 mb-4">Page Not Found</h1>
        <Link to="/" className="text-verde-500 font-body font-semibold underline">Return home</Link>
      </div>
    );
  }

  const Icon = content.icon;

  return (
    <div className="pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-verde-50 text-verde-700 px-4 py-1.5 rounded-full font-data text-xs uppercase tracking-widest mb-6">
            <Icon size={12} /> {content.title}
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-3">
            {content.title}
          </h1>
          <p className="text-text-muted font-data text-sm">
            Last updated: {content.updated}
          </p>
        </div>

        <div className="space-y-8">
          {content.sections.map((section, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-verde-100 p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-verde-700 mb-3 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gold-500 rounded-full" />
                {section.heading}
              </h2>
              <p className="text-text-secondary font-body leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-muted font-body text-sm mb-4">
            Have questions? We're here to help.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 px-6 py-3 rounded-xl font-body font-semibold hover:bg-gold-400 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
