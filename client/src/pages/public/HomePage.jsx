import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiBeaker, HiUsers, HiClock, HiGlobeAlt } from 'react-icons/hi2';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import Marquee from '../../components/shared/Marquee.jsx';
import { fetchFeaturedProducts, fetchCategories, fetchPartners } from '../../api/services';

const METRICS = [
  { icon: HiClock, value: '40+', label: 'Years of Experience' },
  { icon: HiBeaker, value: '10,000+', label: 'Cases Served' },
  { icon: HiGlobeAlt, value: '50+', label: 'Brands Represented' },
  { icon: HiUsers, value: '500+', label: 'Active Clients' },
];

const CEO_QUOTE = `"For more than four decades we have built Sentron Asia International on a single principle: a laboratory is only as reliable as the equipment and the people who stand behind it. Our commitment does not end at delivery — it begins there."`;
const CEO_NAME = 'Mr. Anis Ahmad';
const CEO_TITLE = 'Founder';

export default function HomePage() {
  const { data: featuredProducts } = useQuery({
    queryKey: ['products', 'isFeatured'],
    queryFn: fetchFeaturedProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: partners } = useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  return (
    <>
      <SEOHead
        title="Sentron Asia International"
        description="Leading supplier of scientific, laboratory, and analytical equipment across Asia. 40+ years of trusted experience."
      />

      {/* ---- Hero Section ---- */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img
            src="/assets/hero-lab.jpg"
            alt=""
            className="hero-bg-image"
            loading="eager"
            fetchPriority="high"
          />
          <div className="hero-overlay" />
        </div>
        <div className="container hero-content">
          <ScrollReveal direction="up">
            <h6 className="hero-subtitle">Sentron Asia International</h6>
            <h1 className="hero-title">
              Connect with the<br />Scientific World
            </h1>
            <p className="hero-description">
              Your trusted partner for precision laboratory and analytical instruments, serving the scientific community for over four decades.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-accent btn-lg">
                Explore Products <HiArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg hero-btn-outline">
                Contact Us
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---- Metrics Bar ---- */}
      <section className="section-sm metrics-section" id="metrics">
        <div className="container">
          <div className="metrics-grid">
            {METRICS.map((metric, i) => (
              <ScrollReveal key={metric.label} delay={i * 100}>
                <div className="metric-card glass-card-light">
                  <metric.icon className="metric-icon" />
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CEO Message ---- */}
      <section className="section ceo-section" id="ceo-message">
        <div className="container container-narrow">
          <ScrollReveal>
            <div className="ceo-card glass-card-light">
              <blockquote className="ceo-quote">
                {CEO_QUOTE}
              </blockquote>
              <div className="ceo-attribution">
                <div className="ceo-avatar">
                  <span className="ceo-avatar-initials">AA</span>
                </div>
                <div>
                  <p className="ceo-name">{CEO_NAME}</p>
                  <p className="ceo-title">{CEO_TITLE}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---- Partner Logo Marquee ---- */}
      {partners?.data?.length > 0 && (
        <section className="section-sm partners-section" id="partners">
          <div className="container">
            <ScrollReveal>
              <h6 className="section-label">Trusted By Leading Brands</h6>
            </ScrollReveal>
          </div>
          <Marquee speed={35} blendMode className="partners-marquee">
            {partners.data.flatMap((partner) => {
              const logos = partner.logos && partner.logos.length > 0
                ? partner.logos
                : (partner.logo ? [partner.logo] : []);
              return logos.map((logoUrl, idx) => (
                <img
                  key={`${partner._id}-${idx}`}
                  src={logoUrl}
                  alt={partner.name}
                  className="partner-logo"
                  loading="lazy"
                />
              ));
            })}
          </Marquee>
        </section>
      )}

      {/* ---- Featured Products Marquee ---- */}
      {featuredProducts?.data?.length > 0 && (
        <section className="section" id="featured-products">
          <div className="container">
            <ScrollReveal>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-description">
                Discover our most sought-after laboratory and analytical instruments.
              </p>
            </ScrollReveal>
          </div>
          <Marquee speed={40} className="featured-marquee">
            {featuredProducts.data.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product.slug}`}
                className="featured-product-card glass-card-light-hover"
              >
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="featured-product-image"
                    loading="lazy"
                  />
                )}
                <div className="featured-product-info">
                  <h4 className="featured-product-name">{product.name}</h4>
                  {product.category?.name && (
                    <span className="badge badge-primary">{product.category.name}</span>
                  )}
                </div>
              </Link>
            ))}
          </Marquee>
        </section>
      )}

      {/* ---- Categories Grid ---- */}
      <section className="section categories-section" id="categories">
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title">Product Categories</h2>
            <p className="section-description">
              Browse our comprehensive range of scientific equipment by category.
            </p>
          </ScrollReveal>

          <div className="categories-grid">
            {(categories?.data || PLACEHOLDER_CATEGORIES).map((cat, i) => (
              <ScrollReveal key={cat._id || cat.name} delay={i * 80}>
                <Link
                  to={`/products/${cat._id || cat.slug}`}
                  className="category-card glass-card-light-hover"
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="category-card-image" loading="lazy" />
                  ) : (
                    <div className="category-card-placeholder">
                      <HiBeaker className="category-card-placeholder-icon" />
                    </div>
                  )}
                  <div className="category-card-content">
                    <h3 className="category-card-title">{cat.name}</h3>
                    {cat.description && (
                      <p className="category-card-desc">{cat.description}</p>
                    )}
                  </div>
                  <span className="category-card-arrow">
                    <HiArrowRight />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// Placeholder categories until real data is available
const PLACEHOLDER_CATEGORIES = [
  { name: 'Analytical Instruments', description: 'Spectroscopy, chromatography & elemental analysis', slug: 'analytical' },
  { name: 'Life Sciences', description: 'Cell culture, molecular biology & genomics', slug: 'life-sciences' },
  { name: 'Clinical Diagnostics', description: 'Hematology, immunoassay & biochemistry', slug: 'clinical' },
  { name: 'Environmental Testing', description: 'Water quality, air monitoring & soil analysis', slug: 'environmental' },
  { name: 'General Laboratory', description: 'Centrifuges, incubators & balances', slug: 'general-lab' },
  { name: 'Material Science', description: 'Thermal analysis, microscopy & rheology', slug: 'material-science' },
];
