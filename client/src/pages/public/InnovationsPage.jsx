import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import TiltCard from '../../components/shared/TiltCard.jsx';
import { fetchBrands } from '../../api/services';

/* ---- Brand Showcase Grid (main /innovations page) ---- */
export default function InnovationsPage() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });

  return (
    <>
      <SEOHead
        title="Innovations & Highlights"
        description="Explore our brand partners and their cutting-edge innovations in laboratory and scientific equipment."
      />

      <section className="products-page-header">
        <div className="container">
          <ScrollReveal>
            <span className="page-header-badge">Technological Highlights</span>
            <h1>Innovations & Highlights</h1>
            <p>Discover the brands driving scientific progress and their breakthrough solutions.</p>
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
            <div className="brands-grid">
              {brands?.data?.map((brand, i) => (
                <ScrollReveal key={brand._id} delay={i * 80}>
                  <TiltCard className="brand-card glass-card-light-hover">
                    <Link to={`/innovations/${brand._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', width: '100%' }}>
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="brand-card-logo" loading="lazy" />
                      ) : (
                        <div className="brand-card-logo" style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                          {brand.name}
                        </div>
                      )}
                      <h3 className="brand-card-name">{brand.name}</h3>
                      {brand.description && <p className="brand-card-desc">{brand.description}</p>}
                      <span className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }}>
                        View Innovations <HiArrowRight />
                      </span>
                    </Link>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

