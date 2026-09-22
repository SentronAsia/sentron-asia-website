import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import { fetchBrandById, fetchShowcaseStories } from '../../api/services';

export default function PalmSensStories() {
  const { brandId } = useParams();

  const { data: brand } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => fetchBrandById(brandId),
    enabled: !!brandId,
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ['showcase-stories', brandId],
    queryFn: () => fetchShowcaseStories(brandId),
    enabled: !!brandId,
  });

  return (
    <>
      <SEOHead
        title={brand?.data?.name ? `${brand.data.name} — Research & Innovations` : 'Research & Innovations'}
        description={brand?.data?.description || 'Explore the latest research and applications powered by our instruments.'}
      />

      <section className="products-page-header">
        <div className="container">
          <ScrollReveal>
            {brand?.data?.logo && (
              <img src={brand.data.logo} alt={brand.data.name} style={{ height: 64, marginBottom: '1rem', objectFit: 'contain' }} />
            )}
            <h1>{brand?.data?.name ? `${brand.data.name} Research Showcase` : 'Research Showcase'}</h1>
            {brand?.data?.description && <p>{brand.data.description}</p>}
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(4rem, 8vw, 6rem)' }}>
              {stories?.data?.map((story, i) => (
                <ScrollReveal key={story._id} delay={i * 100}>
                  <div className={`story-section ${i % 2 !== 0 ? 'story-section--reverse' : ''}`} style={{ alignItems: 'center' }}>
                    
                    {/* Image Column */}
                    {story.imageUrl && (
                      <div className="glass-image-frame" style={{ flex: 1 }}>
                        <img 
                          src={story.imageUrl} 
                          alt={story.title} 
                          className="story-image" 
                          loading="lazy" 
                          style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)' }}
                        />
                      </div>
                    )}
                    
                    {/* Text Column */}
                    <div className="story-content" style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        {story.title}
                      </h2>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                        {story.researcherName && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: '120px' }}>Researcher:</span>
                            <span>{story.researcherName}</span>
                          </div>
                        )}
                        {story.institution && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: '120px' }}>Institution:</span>
                            <span>{story.institution}</span>
                          </div>
                        )}
                        {story.studyTitle && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: '120px' }}>Study:</span>
                            <span>{story.studyTitle}</span>
                          </div>
                        )}
                        {story.applicationField && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: '120px' }}>Field:</span>
                            <span><span className="badge badge-primary">{story.applicationField}</span></span>
                          </div>
                        )}
                      </div>

                      {story.abstract && (
                        <div>
                          <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Abstract</h4>
                          <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>{story.abstract}</p>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              {!isLoading && (!stories?.data || stories.data.length === 0) && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                  <p>No research showcases available for this brand yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
