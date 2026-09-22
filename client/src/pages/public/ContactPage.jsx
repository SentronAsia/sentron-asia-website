import { useState } from 'react';
import { HiMapPin, HiPhone, HiEnvelope, HiClock } from 'react-icons/hi2';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import { submitContactForm } from '../../api/services';

const CONTACT_INFO = [
  {
    icon: HiMapPin,
    label: 'Address',
    value: '16-Aurangzeb Block, New Garden Town,\nLahore, Pakistan',
  },
  {
    icon: HiPhone,
    label: 'Phone',
    value: '+92-42-35838165',
    href: 'tel:+924235838165',
  },
  {
    icon: HiEnvelope,
    label: 'Email',
    value: 'sentronasia@yahoo.com',
    href: 'mailto:sentronasia@yahoo.com',
  },
  {
    icon: HiClock,
    label: 'Business Hours',
    value: 'Monday – Friday: 9:00 AM – 6:00 PM\nSaturday: 9:00 AM – 1:00 PM',
  },
];

const MAPS_URL = 'https://www.google.com/maps?q=31.549196,74.380081&z=16&output=embed';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await submitContactForm(form);
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us"
        description="Get in touch with Sentron Asia International. Visit our office in Lahore, Pakistan, or send us a message."
      />

      <section className="products-page-header">
        <div className="container">
          <ScrollReveal>
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Reach out to us with any questions or inquiries.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Two-column: Info + Map */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Left: Contact Details */}
            <ScrollReveal direction="left">
              <div className="contact-info-list">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="contact-info-block">
                    <item.icon className="contact-info-icon" />
                    <div>
                      <p className="contact-info-label">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="contact-info-value" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
                          {item.value}
                        </a>
                      ) : (
                        <p className="contact-info-value" style={{ whiteSpace: 'pre-line' }}>
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Right: Google Maps */}
            <ScrollReveal direction="right">
              <div className="contact-map">
                <iframe
                  src={MAPS_URL}
                  title="Sentron Asia International Office Location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section contact-form-section">
        <div className="container">
          <div className="contact-form-inner">
            <ScrollReveal>
              <h2 style={{ marginBottom: '0.5rem' }}>Send Us a Message</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                Fill out the form below and our team will respond within 24 hours.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">Full Name</label>
                    <input type="text" id="contact-name" name="name" className="form-input" required value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">Email</label>
                    <input type="email" id="contact-email" name="email" className="form-input" required value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone" className="form-label">Phone</label>
                    <input type="tel" id="contact-phone" name="phone" className="form-input" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-subject" className="form-label">Subject</label>
                    <input type="text" id="contact-subject" name="subject" className="form-input" required value={form.subject} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">Message</label>
                  <textarea id="contact-message" name="message" className="form-input form-textarea" required value={form.message} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-accent" disabled={status === 'sending'} id="contact-submit">
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {status === 'sent' && <p className="footer-form-success">Thank you! We'll get back to you within 24 hours.</p>}
                {status === 'error' && <p className="form-error">{errorMsg}</p>}
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
