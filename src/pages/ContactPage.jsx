import { useState } from 'react';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.contact-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2,
    });
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClasses = 'w-full px-4 py-3 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-transparent transition-all';

  return (
    <div className="pt-28 pb-20 px-4 md:px-8">
      <div ref={heroRef} className="max-w-4xl mx-auto mb-16">
        <h1 className="contact-anim font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-4">
          Get in Touch
        </h1>
        <p className="contact-anim text-text-secondary font-body text-lg">
          Have a question or ready to book? We would love to hear from you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        <div className="bg-surface rounded-3xl border border-verde-100 p-8 shadow-card">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-verde-100 flex items-center justify-center mb-6">
                <CheckCircle size={32} className="text-verde-500" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-verde-800 mb-3">Message Sent!</h3>
              <p className="text-text-secondary font-body">We will get back to you within 24 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-6 text-verde-500 font-body font-semibold underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-medium text-verde-700 mb-1.5">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClasses} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-verde-700 mb-1.5">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClasses} placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-verde-700 mb-1.5">Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={inputClasses}>
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="property">Property Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-verde-700 mb-1.5">Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={inputClasses} placeholder="How can we help?" />
              </div>
              <button
                type="submit"
                className="w-full bg-gold-500 text-verde-800 py-3 rounded-xl font-body font-semibold flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-surface rounded-3xl border border-verde-100 p-8 shadow-card">
            <h3 className="font-heading text-xl font-bold text-verde-800 mb-6">Contact Information</h3>
            <div className="space-y-5">
              {[
                { icon: Phone, label: 'Phone', value: '(305) 440-0808', href: 'tel:+13054400808' },
                { icon: Mail, label: 'Email', value: 'jmordan57@gmail.com', href: 'mailto:jmordan57@gmail.com' },
                { icon: MapPin, label: 'Location', value: '1718 SW 11 St, Miami, FL 33135' },
                { icon: Clock, label: 'Response Time', value: 'Within an hour' },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-verde-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-verde-500" />
                  </div>
                  <div>
                    <div className="font-data text-xs uppercase tracking-wider text-text-muted">{label}</div>
                    {href ? (
                      <a href={href} className="font-body text-verde-700 hover:text-gold-600 transition-colors">{value}</a>
                    ) : (
                      <span className="font-body text-verde-700">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-verde-100 shadow-card h-64">
            <iframe
              title="Villa Verde Miami Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14362.517889204147!2d-80.22!3d25.765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b6f0c20a3c7d%3A0x5e5b2e3fce3e6a3c!2sLittle%20Havana%2C%20Miami%2C%20FL!5e0!3m2!1sen!2sus!4v1709000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
