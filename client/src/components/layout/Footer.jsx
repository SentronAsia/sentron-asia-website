import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiEnvelope, HiPhone, HiMapPin } from 'react-icons/hi2';
import { submitContactForm } from '../../api/services';

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Innovations', to: '/innovations' },
  { label: 'Downloads', to: '/downloads' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function FooterContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
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
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <form className="footer-contact-form" onSubmit={handleSubmit}>
      <h4 className="footer-heading">Get in Touch</h4>
      <div className="form-group">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="form-input"
          id="footer-contact-name"
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          className="form-input"
          id="footer-contact-email"
        />
      </div>
      <div className="form-group">
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          rows={3}
          className="form-input form-textarea"
          id="footer-contact-message"
        />
      </div>
      <button
        type="submit"
        className="btn btn-accent btn-sm"
        disabled={status === 'sending'}
        id="footer-contact-submit"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
      {status === 'sent' && (
        <p className="footer-form-success">Thank you! We'll get back to you soon.</p>
      )}
      {status === 'error' && (
        <p className="form-error">{errorMsg}</p>
      )}
    </form>
  );
}

export default function Footer() {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  return (
    <footer className="site-footer" id="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Contact Form — hidden on /contact page */}
          {!isContactPage && (
            <div className="footer-column">
              <FooterContactForm />
            </div>
          )}

          {/* Navigation */}
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <nav className="footer-nav" aria-label="Footer navigation">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="footer-nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company Info */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact Info</h4>
            <div className="footer-info">
              <div className="footer-info-item">
                <HiMapPin className="footer-info-icon" />
                <p>16-Aurangzeb Block, New Garden Town, Lahore, Pakistan</p>
              </div>
              <div className="footer-info-item">
                <HiPhone className="footer-info-icon" />
                <p>+92-42-35838165</p>
              </div>
              <div className="footer-info-item">
                <HiEnvelope className="footer-info-icon" />
                <a href="mailto:sentronasia@yahoo.com">sentronasia@yahoo.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Sentron Asia International. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
