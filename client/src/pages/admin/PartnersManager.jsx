import { useQuery } from '@tanstack/react-query';
import ContentManager from '../../features/admin/ContentManager.jsx';
import Marquee from '../../components/shared/Marquee.jsx';
import {
  adminFetchPartners, adminCreatePartner,
  adminUpdatePartner, adminDeletePartner,
} from '../../api/services';

const columns = [
  {
    key: 'logo', label: 'Logos',
    render: (item) => {
       const logos = item.logos && item.logos.length > 0 ? item.logos : (item.logo ? [item.logo] : []);
       return (
         <div style={{ display: 'flex', gap: '0.25rem' }}>
           {logos.slice(0, 3).map((url, i) => (
             <img key={i} src={url} alt="" style={{ width: 48, height: 48, objectFit: 'contain', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }} />
           ))}
           {logos.length > 3 && <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>+{logos.length - 3}</span>}
           {logos.length === 0 && '–'}
         </div>
       );
    }
  },
  { key: 'name', label: 'Partner Name' },
  { 
    key: 'url', label: 'Website URL',
    render: (item) => item.url ? <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>Link</a> : '–'
  },
  { key: 'order', label: 'Display Order' },
];

const formFields = [
  { key: 'name', label: 'Partner Name', required: true, placeholder: 'e.g. Thermo Fisher' },
  { key: 'url', label: 'Website URL', type: 'url', placeholder: 'https://...' },
  { key: 'order', label: 'Display Order', type: 'number', placeholder: '0' },
  { key: 'logos', label: 'Partner Logos', type: 'multi-image', required: true },
];

export default function PartnersManager() {
  const { data: partnersData } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: adminFetchPartners,
  });

  const partners = partnersData?.data || [];
  const allMarqueeLogos = partners.flatMap((p) => {
    const list = p.logos && p.logos.length > 0 ? p.logos : (p.logo ? [p.logo] : []);
    return list.map((url, idx) => ({ id: `${p._id}-${idx}`, url, partnerName: p.name }));
  });

  return (
    <div className="partners-manager" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', minHeight: '100%' }}>
      {allMarqueeLogos.length > 0 && (
        <div className="partner-marquee-preview-card glass-card-light" style={{ width: '100%' }}>
          <div className="partner-marquee-preview-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="badge badge-accent">Live Homepage Marquee Preview</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{allMarqueeLogos.length} logos looping</span>
          </div>
          <div className="partner-marquee-container" style={{ background: 'var(--color-surface)', padding: '0.5rem 0', borderRadius: 'var(--radius-md)' }}>
            <Marquee speed={35} blendMode className="partners-marquee">
              {allMarqueeLogos.map((item) => (
                <div key={item.id} className="partner-marquee-item" title={item.partnerName} style={{ margin: '0 2rem' }}>
                  <img src={item.url} alt={item.partnerName} className="partner-logo" style={{ height: '40px', objectFit: 'contain' }} />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      )}

      <div style={{ flex: 1, width: '100%' }}>
        <ContentManager
          title="Partners & Client Logos"
          queryKey="admin-partners"
          fetchFn={adminFetchPartners}
          createFn={adminCreatePartner}
          updateFn={adminUpdatePartner}
          deleteFn={adminDeletePartner}
          columns={columns}
          formFields={formFields}
        />
      </div>
    </div>
  );
}
