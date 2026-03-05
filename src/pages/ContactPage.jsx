import { useState } from 'react';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { useSiteContent } from '@/hooks/useSiteContent';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { sendContactMessage } from '@/lib/api';

export default function ContactPage() {
  const { content, loading } = useSiteContent('contact');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const heroRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.contact-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2,
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await sendContactMessage(form);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-verde-500" />
      </div>
    );
  }

  const phone = content?.phone || '(305) 440-0808';
  const phoneHref = content?.phone ? `tel:${content.phone.replace(/[^0-9+]/g, '')}` : 'tel:3054400808';
  const email = content?.email || 'jmordan57@gmail.com';
  const address = content?.address || '1718 SW 11 St, Miami, FL 33135';
  const responseTime = content?.responseTime || 'Within an hour';
  const subjects = content?.subjects || [
    { value: 'booking', label: 'Booking Inquiry' },
    { value: 'property', label: 'Property Question' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div>
      <section ref={heroRef} className="pt-32 pb-16 px-4 md:px-8 bg-verde-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="contact-anim font-heading italic text-5xl md:text-7xl font-bold text-cream-100 mb-4">
            {content?.heroHeading || 'Get in Touch'}
          </h1>
          <p className="contact-anim text-cream-200/70 font-body text-lg">
            {content?.heroSubtitle || 'We would love to hear from you. Send us a message and we will get back to you soon.'}
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            {submitted ? (
              <div className="bg-verde-50 rounded-3xl p-8 text-center">
                <CheckCircle size={48} className="text-verde-500 mx-auto mb-4" />
                <h3 className="font-heading text-2xl font-bold text-verde-800 mb-2">Message Sent!</h3>
                <p className="font-body text-text-secondary">We will get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="mt-4 text-verde-600 font-body font-medium hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-body text-sm font-medium text-verde-800 mb-2">Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-verde-200 font-body focus:outline-none focus:ring-2 focus:ring-verde-500 bg-surface" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-verde-800 mb-2">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-verde-200 font-body focus:outline-none focus:ring-2 focus:ring-verde-500 bg-surface" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-verde-800 mb-2">Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-verde-200 font-body focus:outline-none focus:ring-2 focus:ring-verde-500 bg-surface">
                    <option value="">Select a topic</option>
                    {subjects.map((subj) => (
                      <option key={subj.value} value={subj.value}>{subj.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-verde-800 mb-2">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 rounded-xl border border-verde-200 font-body focus:outline-none focus:ring-2 focus:ring-verde-500 bg-surface resize-none" />
                </div>
                {error && <p className="text-red-600 font-body text-sm">{error}</p>}
                <button type="submit" disabled={sending} className="w-full bg-verde-500 text-cream-100 py-4 rounded-full font-body font-bold text-lg hover:bg-verde-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {sending ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-cream-200 rounded-3xl p-8">
              <h3 className="font-heading text-2xl font-bold text-verde-800 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <a href={phoneHref} className="flex items-center gap-3 font-body text-verde-700 hover:text-verde-500 transition-colors">
                  <Phone size={18} className="text-gold-500" /> {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-3 font-body text-verde-700 hover:text-verde-500 transition-colors">
                  <Mail size={18} className="text-gold-500" /> {email}
                </a>
                <div className="flex items-center gap-3 font-body text-verde-700">
                  <MapPin size={18} className="text-gold-500" /> {address}
                </div>
                <div className="flex items-center gap-3 font-body text-verde-700">
                  <Clock size={18} className="text-gold-500" /> Response time: {responseTime}
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3593.0!2d-80.2295!3d25.7637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDQ1JzQ5LjMiTiA4MMKwMTMnNDYuMiJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
