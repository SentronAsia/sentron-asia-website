import { Helmet } from 'react-helmet-async';

export default function SEOHead({
  title = 'Sentron Asia International',
  description = 'Leading supplier of scientific, laboratory, and analytical equipment across Asia.',
  keywords = '',
  noindex = false,
}) {
  const fullTitle = title === 'Sentron Asia International'
    ? title
    : `${title} — Sentron Asia International`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}
