import { useQuery } from '@tanstack/react-query';
import { HiArrowDownTray, HiDocumentText, HiDocumentChartBar, HiDocument } from 'react-icons/hi2';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ScrollReveal from '../../components/shared/ScrollReveal.jsx';
import { fetchDocuments, getDocumentDownloadUrl } from '../../api/services';

const DOC_ICONS = {
  'Brochure': HiDocumentText,
  'Datasheet': HiDocumentChartBar,
  'Manual': HiDocument,
  'Certificate': HiDocumentText,
  'default': HiDocument,
};

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DownloadsPage() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocuments(),
  });

  const handleDownload = async (docId, docName) => {
    try {
      const result = await getDocumentDownloadUrl(docId);
      const link = document.createElement('a');
      link.href = result.url;
      link.download = docName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Failed to generate download link. Please try again.');
    }
  };

  // Group documents by type
  const groupedDocs = {};
  if (documents?.data) {
    for (const doc of documents.data) {
      const type = doc.type || 'Other';
      if (!groupedDocs[type]) groupedDocs[type] = [];
      groupedDocs[type].push(doc);
    }
  }

  return (
    <>
      <SEOHead
        title="Downloads"
        description="Download brochures, datasheets, manuals, and certificates for our scientific equipment."
      />

      <section className="products-page-header">
        <div className="container">
          <ScrollReveal>
            <h1>Downloads</h1>
            <p>Access product documentation, brochures, datasheets, and certificates.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : Object.keys(groupedDocs).length > 0 ? (
            Object.entries(groupedDocs).map(([type, docs]) => {
              const Icon = DOC_ICONS[type] || DOC_ICONS.default;
              return (
                <div key={type} style={{ marginBottom: '2.5rem' }}>
                  <ScrollReveal>
                    <h3 style={{ marginBottom: '1rem' }}>{type}s</h3>
                  </ScrollReveal>
                  <div className="downloads-grid">
                    {docs.map((doc, i) => (
                      <ScrollReveal key={doc._id} delay={i * 60}>
                        <div className="download-card glass-card-light">
                          <Icon className="download-icon" />
                          <div className="download-info">
                            <p className="download-name">{doc.name}</p>
                            <p className="download-meta">
                              {doc.type}{doc.fileSize ? ` • ${formatFileSize(doc.fileSize)}` : ''}
                            </p>
                          </div>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDownload(doc._id, doc.name)}
                            aria-label={`Download ${doc.name}`}
                          >
                            <HiArrowDownTray />
                          </button>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
              <p>No documents available at this time.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
