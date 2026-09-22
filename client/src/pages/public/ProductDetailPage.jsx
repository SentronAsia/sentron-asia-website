import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { HiEnvelope } from 'react-icons/hi2';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import { fetchProductBySlug, submitEnquiryForm } from '../../api/services';

/**
 * Renders a flexible specifications table from a MongoDB document.
 * Handles objects, arrays, and nested structures.
 */
function SpecsTable({ specs }) {
  if (!specs || typeof specs !== 'object') return null;

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return (
        <table className="specs-table" style={{ marginBottom: 0 }}>
          <tbody>
            {Object.entries(value).map(([k, v]) => (
              <tr key={k}>
                <th>{k}</th>
                <td>{renderValue(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return String(value);
  };

  const entries = Array.isArray(specs)
    ? specs.map((item, i) => [item.key || `Spec ${i + 1}`, item.value])
    : Object.entries(specs);

  return (
    <table className="specs-table">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{renderValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EnquiryForm({ productName }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitEnquiryForm({ ...form, product: productName });
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to send. Please try again.');
    }
  };

  return (
    <form className="enquiry-form" onSubmit={handleSubmit} id="enquiry-form">
      <h3>Enquire About This Product</h3>
      <p className="section-description" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
        Interested in <strong>{productName}</strong>? Fill out the form below and our team will get back to you promptly.
      </p>
      <div className="enquiry-form-grid">
        <div className="form-group">
          <label htmlFor="enquiry-name" className="form-label">Name</label>
          <input type="text" id="enquiry-name" name="name" className="form-input" required value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="enquiry-email" className="form-label">Email</label>
          <input type="email" id="enquiry-email" name="email" className="form-input" required value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="enquiry-phone" className="form-label">Phone</label>
          <input type="tel" id="enquiry-phone" name="phone" className="form-input" value={form.phone} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="enquiry-message" className="form-label">Message</label>
        <textarea id="enquiry-message" name="message" className="form-input form-textarea" required value={form.message} onChange={handleChange} />
      </div>
      <button type="submit" className="btn btn-accent" disabled={status === 'sending'} id="enquiry-submit">
        <HiEnvelope /> {status === 'sending' ? 'Sending...' : 'Send Enquiry'}
      </button>
      {status === 'sent' && <p className="footer-form-success">Thank you! We'll respond shortly.</p>}
      {status === 'error' && <p className="form-error">{errorMsg}</p>}
    </form>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (error || !product?.data) {
    return (
      <div className="section container" style={{ textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          The product you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const p = product.data;

  const scrollToEnquiry = () => {
    document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead title={p.name} description={p.description?.substring(0, 160)} />

      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="product-detail-grid">
              {/* Image */}
              <div className="glass-image-frame">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="product-detail-image" />
                ) : (
                  <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                    No Image Available
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                {p.category?.name && <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>{p.category.name}</span>}
                <h1 className="product-detail-name">{p.name}</h1>
                <p className="product-detail-description">{p.description}</p>

                <button className="btn btn-accent btn-lg" onClick={scrollToEnquiry}>
                  <HiEnvelope /> Enquire About This Product
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Specifications */}
      {p.specifications && Object.keys(p.specifications).length > 0 && (
        <section className="section-sm" style={{ background: 'var(--color-surface)', borderBlock: '1px solid var(--color-border)' }}>
          <div className="container container-narrow">
            <ScrollReveal>
              <h2 style={{ marginBottom: '1.5rem' }}>Specifications</h2>
              <div className="glass-card-light" style={{ padding: '0.5rem 0', overflow: 'hidden' }}>
                <SpecsTable specs={p.specifications} />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Enquiry Form */}
      <section className="section enquiry-form-wrapper">
        <div className="container container-narrow">
          <ScrollReveal>
            <EnquiryForm productName={p.name} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
