import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiPlus,
  HiTrash,
  HiXMark,
  HiOutlineCloudArrowUp,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineDocument,
  HiOutlineTableCells,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import {
  adminFetchDocuments,
  adminCreateDocument,
  adminDeleteDocument,
  getDocumentDownloadUrl,
} from '../../api/services';

// Helper to format bytes to human readable string
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '–';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// Helper to format date cleanly: "Sep 22, 2026"
function formatDate(dateString) {
  if (!dateString) return '–';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return '–';
  }
}

// Helper to detect document type and icon
function getDocumentTypeInfo(typeStr = '', filename = '') {
  const check = (typeStr || filename || '').toLowerCase();
  if (check.includes('pdf') || check.endsWith('.pdf')) {
    return { label: 'PDF', icon: HiOutlineDocumentText, color: 'var(--color-danger)', bg: 'color-mix(in oklch, var(--color-danger) 12%, transparent)' };
  }
  if (check.includes('word') || check.includes('doc') || check.endsWith('.doc') || check.endsWith('.docx')) {
    return { label: 'Word', icon: HiOutlineDocument, color: 'var(--color-primary)', bg: 'color-mix(in oklch, var(--color-primary) 12%, transparent)' };
  }
  if (check.includes('sheet') || check.includes('excel') || check.includes('xls') || check.endsWith('.xls') || check.endsWith('.xlsx')) {
    return { label: 'Excel', icon: HiOutlineTableCells, color: 'var(--color-success)', bg: 'color-mix(in oklch, var(--color-success) 12%, transparent)' };
  }
  if (check.includes('txt') || check.includes('text') || check.endsWith('.txt')) {
    return { label: 'Text', icon: HiOutlineDocumentText, color: 'var(--color-text-muted)', bg: 'var(--color-surface-hover)' };
  }
  return { label: typeStr || 'Document', icon: HiOutlineDocument, color: 'var(--color-accent)', bg: 'color-mix(in oklch, var(--color-accent) 12%, transparent)' };
}

export default function DocumentsManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [detectedType, setDetectedType] = useState('PDF');
  const [detectedSize, setDetectedSize] = useState(0);
  const [formError, setFormError] = useState('');

  // Query documents list
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: adminFetchDocuments,
  });

  const documents = documentsData?.data || [];

  const resetForm = () => {
    setName('');
    setSelectedFile(null);
    setDetectedType('PDF');
    setDetectedSize(0);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };

  // Auto-detection when file is selected
  const handleFileChange = useCallback((file) => {
    if (!file) return;

    // Validate file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
    const hasValidExt = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setFormError('Please select a valid document file (.pdf, .doc, .docx, .xls, .xlsx, .txt).');
      return;
    }

    setFormError('');
    setSelectedFile(file);
    setDetectedSize(file.size);

    // Auto-detect type
    const typeInfo = getDocumentTypeInfo('', file.name);
    setDetectedType(typeInfo.label);

    // Auto-populate Document Name if empty
    if (!name.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setName(cleanName);
    }
  }, [name]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => adminCreateDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to upload document.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      setDeleteConfirm(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFormError('Please select a document file from your computer.');
      return;
    }

    if (!name.trim()) {
      setFormError('Please enter a document name.');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('name', name.trim());
    formData.append('fileType', detectedType);
    formData.append('type', detectedType);
    formData.append('size', detectedSize);
    formData.append('fileSize', detectedSize);

    createMutation.mutate(formData);
  };

  const handleDownload = async (doc) => {
    try {
      const targetUrl = doc.fileUrl || doc.fileKey;
      if (targetUrl && (targetUrl.startsWith('http') || targetUrl.startsWith('data:'))) {
        window.open(targetUrl, '_blank');
        return;
      }
      const res = await getDocumentDownloadUrl(doc._id);
      if (res?.url) {
        window.open(res.url, '_blank');
      }
    } catch {
      alert('Could not download file. Please try again.');
    }
  };

  const isUploading = createMutation.isPending;

  return (
    <div className="documents-manager">
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Documents</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Upload brochures, datasheets, certificates, and technical manuals directly from your local PC.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <HiPlus /> Add Document
        </button>
      </div>

      {/* Documents Data Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card-light">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th style={{ width: '150px' }}>Document Type</th>
                <th style={{ width: '120px' }}>File Size</th>
                <th style={{ width: '150px' }}>Date Added</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc) => {
                  const type = doc.fileType || doc.type || 'PDF';
                  const typeInfo = getDocumentTypeInfo(type, doc.name);
                  const Icon = typeInfo.icon;
                  const size = doc.size || doc.fileSize;

                  return (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '2.25rem',
                              height: '2.25rem',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: typeInfo.bg,
                              color: typeInfo.color,
                              flexShrink: 0,
                            }}
                          >
                            <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.9375rem' }}>{doc.name}</strong>
                            <span className="text-xs text-muted">
                              {doc.fileUrl ? (doc.fileUrl.startsWith('data:') ? 'Local buffer' : doc.fileUrl.slice(0, 45) + '...') : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: typeInfo.color,
                            background: typeInfo.bg,
                            border: `1px solid ${typeInfo.color}30`,
                            fontWeight: 600,
                          }}
                        >
                          <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
                          {type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                          {formatBytes(size)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(doc.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDownload(doc)}
                            title="Download Document"
                            aria-label={`Download ${doc.name}`}
                          >
                            <HiOutlineArrowDownTray style={{ fontSize: '1rem', color: 'var(--color-primary)' }} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setDeleteConfirm(doc)}
                            title="Delete Document"
                            aria-label={`Delete ${doc.name}`}
                          >
                            <HiTrash style={{ fontSize: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
                    No documents uploaded yet. Click <strong>"Add Document"</strong> to upload a document from your PC.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Document Modal with Native File Upload & Auto-Detection */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-content glass-card-light"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', width: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Upload Document</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Native Document Dropzone */}
              <div className="form-group">
                <label className="form-label">
                  Document File <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>

                {selectedFile ? (
                  <div className="document-selected-card glass-card-light">
                    <div className="document-selected-icon-wrap">
                      <HiOutlineCheckCircle style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-success)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="document-selected-name" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="document-selected-meta">
                        Auto-detected: <strong>{detectedType}</strong> • {formatBytes(detectedSize)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    className={`image-drop-zone ${dragActive ? 'image-drop-zone--active' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '2rem 1rem' }}
                  >
                    <HiOutlineCloudArrowUp className="image-drop-icon" style={{ color: 'var(--color-primary)' }} />
                    <p className="image-drop-text" style={{ marginTop: '0.5rem' }}>
                      <strong>Click to browse</strong> or drag & drop document file
                    </p>
                    <p className="image-drop-subtext">
                      Supports PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Text (.txt) up to 25MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Document Name input */}
              <div className="form-group">
                <label className="form-label" htmlFor="doc-name">
                  Document Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="doc-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sentron Asia Product Catalog 2026"
                  required
                />
              </div>

              {/* Auto-detected metadata badges */}
              {selectedFile && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className="text-xs text-muted">Detected Type:</span>
                  <span className="badge badge-primary">{detectedType}</span>
                  <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                    Size: <strong>{formatBytes(detectedSize)}</strong>
                  </span>
                </div>
              )}

              {formError && (
                <div className="admin-alert admin-alert--danger">
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading || !selectedFile}
                  id="doc-create-submit"
                >
                  {isUploading ? (
                    <>
                      <HiOutlineArrowPath className="spinner" style={{ marginRight: '0.5rem' }} />
                      Uploading to Cloud...
                    </>
                  ) : (
                    'Upload & Save Document'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content glass-card-light" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.75rem' }}>Delete Document</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Delete <strong>"{deleteConfirm.name}"</strong>? This will remove the document download link from the website.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirm._id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
