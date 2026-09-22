import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';

const TIMELINE = [
  { year: '1982', text: 'Founded in Lahore, Pakistan, with a vision to bridge the gap between world-class scientific equipment and Asian laboratories.' },
  { year: '1990', text: 'Expanded distribution partnerships with leading European and American instrument manufacturers.' },
  { year: '2000', text: 'Reached the milestone of serving 5,000+ laboratories across Pakistan and the broader South Asian region.' },
  { year: '2010', text: 'Launched comprehensive after-sales service and calibration capabilities, cementing long-term client relationships.' },
  { year: '2020', text: 'Modernized operations with digital catalogue systems and expanded into environmental and clinical diagnostics markets.' },
  { year: 'Present', text: 'Continuing 40+ years of excellence, representing 50+ global brands and serving 10,000+ cases with unwavering commitment to quality.' },
];

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Sentron Asia International — 40+ years of delivering precision laboratory and analytical equipment to the scientific community."
      />

      <section className="about-hero">
        <div className="container">
          <ScrollReveal>
            <h1>About Sentron Asia International</h1>
            <p>Four decades of connecting laboratories with the world's finest scientific instruments.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <ScrollReveal>
            <div className="about-content">
              <h2>Our Story</h2>
              <p>
                Sentron Asia International was founded in 1982 by Mr. Anis Ahmad with a clear purpose: to provide the scientific community in Pakistan and across Asia with access to the highest-quality laboratory and analytical equipment available anywhere in the world.
              </p>
              <p>
                What began as a small enterprise driven by passion for scientific advancement has grown into one of the region's most trusted suppliers of precision instruments. Over four decades, we have built enduring partnerships with more than 50 globally renowned manufacturers, enabling us to offer a comprehensive range of solutions — from analytical instruments and life science tools to clinical diagnostics and environmental testing equipment.
              </p>
              <p>
                Our philosophy is simple: a laboratory is only as reliable as the equipment and the people who stand behind it. That is why our commitment extends far beyond the point of sale. We provide installation, training, calibration, and ongoing technical support to ensure every instrument delivers the precision and reliability our clients depend on.
              </p>
              <p>
                Today, Sentron Asia International continues to evolve — embracing modern technologies while holding fast to the values of integrity, expertise, and service that have defined us from the very beginning.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-sm" style={{ background: 'var(--color-surface)', borderBlock: '1px solid var(--color-border)' }}>
        <div className="container container-narrow">
          <ScrollReveal>
            <h2 style={{ marginBottom: '2rem' }}>Our Journey</h2>
          </ScrollReveal>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <ScrollReveal key={item.year} delay={i * 100}>
                <div className="timeline-item">
                  <p className="timeline-year">{item.year}</p>
                  <p className="timeline-text">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <ScrollReveal>
            <h2 style={{ marginBottom: '1.5rem' }}>Our Values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {[
                { title: 'Integrity', desc: 'We build trust through transparent, honest partnerships with our clients and brand partners.' },
                { title: 'Expertise', desc: 'Decades of technical knowledge allow us to recommend the right solutions for every application.' },
                { title: 'Service', desc: 'Our commitment begins at delivery — we stand behind every instrument with ongoing support.' },
                { title: 'Innovation', desc: 'We continuously seek new technologies and methodologies to serve the evolving needs of science.' },
              ].map((value) => (
                <div key={value.title} className="glass-card-light" style={{ padding: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{value.title}</h4>
                  <p style={{ fontSize: '0.875rem' }}>{value.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
