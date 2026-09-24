import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Marquee from '../../components/shared/Marquee.jsx';
import { HiPlus, HiPencilSquare, HiTrash, HiXMark } from 'react-icons/hi2';

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [order, setOrder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch Data
  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/partners');
      setPartners(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const allMarqueeLogos = partners.flatMap((p) => {
    const list = p.logos && p.logos.length > 0 ? p.logos : (p.logo ? [p.logo] : []);
    return list.map((url, idx) => ({ id: `${p._id}-${idx}`, url, partnerName: p.name }));
  });

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setName(item.name || '');
      setWebsiteUrl(item.url || '');
      setOrder(item.order || 0);
    } else {
      setEditingItem(null);
      setName('');
      setWebsiteUrl('');
      setOrder(0);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      await api.delete(`/admin/partners/${id}`);
      fetchPartners();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete partner.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (websiteUrl) formData.append('url', websiteUrl);
      if (order !== '') formData.append('order', order);
      
      // Append native files
      if (fileInputRef.current && fileInputRef.current.files) {
        Array.from(fileInputRef.current.files).forEach((file) => {
          formData.append('logos', file);
        });
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingItem) {
        await api.put(`/admin/partners/${editingItem._id}`, formData, config);
      } else {
        await api.post('/admin/partners', formData, config);
      }

      closeModal();
      fetchPartners();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save partner. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', width: '100%', minHeight: '100%' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Partners & Client Logos</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage client logos for the continuous scrolling marquee.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <HiPlus /> Add New Partner
        </button>
      </div>

      {/* LIVE MARQUEE PREVIEW */}
      <div className="glass-card-light" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="badge badge-accent">Live Homepage Marquee Preview</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{allMarqueeLogos.length} logos looping</span>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '1rem 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {allMarqueeLogos.length > 0 ? (
            <Marquee speed={35} blendMode className="partners-marquee">
              {allMarqueeLogos.map((item) => (
                <div key={item.id} className="partner-marquee-item" title={item.partnerName} style={{ margin: '0 2.5rem' }}>
                  <img src={item.url} alt={item.partnerName} style={{ height: '48px', objectFit: 'contain' }} />
                </div>
              ))}
            </Marquee>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No logos uploaded yet.
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM CRUD TABLE */}
      <div className="glass-card-light" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading partners...</div>
        ) : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <th style={{ padding: '1rem', width: '100px' }}>Logos</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>URL</th>
                <th style={{ padding: '1rem', width: '80px' }}>Order</th>
                <th style={{ padding: '1rem', width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.length > 0 ? partners.map((partner) => {
                const logos = partner.logos && partner.logos.length > 0 ? partner.logos : (partner.logo ? [partner.logo] : []);
                return (
                  <tr key={partner._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {logos.slice(0, 3).map((url, i) => (
                          <img key={i} src={url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: '2px' }} />
                        ))}
                        {logos.length > 3 && <span style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>+{logos.length - 3}</span>}
                        {logos.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>–</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{partner.name}</td>
                    <td style={{ padding: '1rem' }}>
                      {partner.url ? <a href={partner.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{partner.url}</a> : <span style={{ color: 'var(--color-text-muted)' }}>–</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>{partner.order}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openModal(partner)} title="Edit">
                          <HiPencilSquare />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(partner._id)} title="Delete">
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No partners found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CUSTOM FORM MODAL */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card-light" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingItem ? 'Edit Partner' : 'Add New Partner'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><HiXMark size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Partner Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Thermo Fisher"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Website URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    value={websiteUrl} 
                    onChange={(e) => setWebsiteUrl(e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Sort Order</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={order} 
                    onChange={(e) => setOrder(e.target.value)} 
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Logos</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  multiple 
                  className="form-input"
                  style={{ padding: '0.5rem 0' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {editingItem ? 'Selecting new files will add to existing logos.' : 'Select one or more images.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
