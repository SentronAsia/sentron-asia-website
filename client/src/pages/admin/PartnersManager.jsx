import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiXMark,
  HiOutlineCloudArrowUp,
  HiOutlineArrowPath,
  HiOutlinePhoto,
  HiOutlineEye,
} from 'react-icons/hi2';
import {
  adminFetchPartners,
  adminCreatePartner,
  adminUpdatePartner,
  adminDeletePartner,
  uploadMultipleFiles,
} from '../../api/services';
import Marquee from '../../components/shared/Marquee.jsx';

export default function PartnersManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showMarqueePreview, setShowMarqueePreview] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [order, setOrder] = useState(0);

  // Logos array: each item has { id, url, file, preview }
  const [logosQueue, setLogosQueue] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState('');

  // Fetch all partners
  const { data: partnersData, isLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: adminFetchPartners,
  });

  const partners = partnersData?.data || [];

  // Flatten all logos across partners for the live marquee preview
  const allMarqueeLogos = partners.flatMap((p) => {
    const list = p.logos && p.logos.length > 0 ? p.logos : (p.logo ? [p.logo] : []);
    return list.map((url, idx) => ({ id: `${p._id}-${idx}`, url, partnerName: p.name }));
  });

  const resetForm = () => {
    setName('');
    setWebsiteUrl('');
    setOrder(0);
    setLogosQueue([]);
    setFormError('');
    setEditingItem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    resetForm();
    setEditingItem(item);
    setName(item.name || '');
    setWebsiteUrl(item.url || '');
    setOrder(item.order || 0);

    const existingLogos = item.logos && item.logos.length > 0
      ? item.logos
      : (item.logo ? [item.logo] : []);

    setLogosQueue(
      existingLogos.map((url, i) => ({
        id: `existing-${i}-${Date.now()}`,
        url,
        preview: url,
        isUploaded: true,
      }))
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };

  // Add files to selection queue and trigger immediate batch upload
  const handleFileSelect = useCallback(async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const incomingFiles = Array.from(filesList).filter((f) => f.type.startsWith('image/'));

    if (incomingFiles.length === 0) {
      setFormError('Please select valid image files.');
      return;
    }

    setFormError('');
    setIsUploading(true);
    setUploadProgress(10);

    // Build temporary preview items
    const tempItems = incomingFiles.map((file, i) => ({
      id: `pending-${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      isUploaded: false,
    }));

    setLogosQueue((prev) => [...prev, ...tempItems]);

    try {
      const formData = new FormData();
      incomingFiles.forEach((file) => formData.append('files', file));

      const onProgress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      const res = await uploadMultipleFiles(formData, onProgress);
      const uploadedUrls = res?.urls || (res?.url ? [res.url] : (Array.isArray(res?.data) ? res.data.map(d => d.url) : []));

      if (uploadedUrls.length > 0) {
        setLogosQueue((prev) => {
          // Replace matching temporary items with uploaded URLs
          let uploadIdx = 0;
          return prev.map((item) => {
            if (!item.isUploaded && uploadIdx < uploadedUrls.length) {
              const url = uploadedUrls[uploadIdx++];
              return {
                ...item,
                url,
                preview: url,
                isUploaded: true,
              };
            }
            return item;
          });
        });
      } else {
        throw new Error('No URLs returned.');
      }
    } catch (err) {
      console.warn('Batch upload failed on server, using data URLs fallback:', err);
      // Read each file as Data URL
      for (const item of tempItems) {
        if (item.file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setLogosQueue((prev) =>
              prev.map((p) => (p.id === item.id ? { ...p, url: e.target.result, preview: e.target.result, isUploaded: true } : p))
            );
          };
          reader.readAsDataURL(item.file);
        }
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeLogo = (idToRemove) => {
    setLogosQueue((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminCreatePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminUpdatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      setDeleteConfirm(null);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Partner name is required.');
      return;
    }

    const finalUrls = logosQueue.map((item) => item.url || item.preview).filter(Boolean);
    if (finalUrls.length === 0) {
      setFormError('Please upload at least one logo for this partner.');
      return;
    }

    const payload = {
      name: name.trim(),
      url: websiteUrl.trim(),
      order: Number(order) || 0,
      logos: finalUrls,
      logo: finalUrls[0],
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="partners-manager">
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Partners & Client Logos</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Upload brand logos from your local PC to populate the continuous scrolling marquee on the homepage.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowMarqueePreview(!showMarqueePreview)}
          >
            <HiOutlineEye /> {showMarqueePreview ? 'Hide Marquee' : 'Show Marquee'}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <HiPlus /> Add Partner Batch
          </button>
        </div>
      </div>

      {/* Live Homepage Marquee Preview */}
      {showMarqueePreview && allMarqueeLogos.length > 0 && (
        <div className="partner-marquee-preview-card glass-card-light" style={{ marginBottom: '1.5rem' }}>
          <div className="partner-marquee-preview-header">
            <span className="badge badge-accent">Live Homepage Marquee Preview</span>
            <span className="text-xs text-muted">{allMarqueeLogos.length} logos in continuous loop</span>
          </div>
          <div className="partner-marquee-container">
            <Marquee speed={35} blendMode className="partners-marquee">
              {allMarqueeLogos.map((item) => (
                <div key={item.id} className="partner-marquee-item" title={item.partnerName}>
                  <img src={item.url} alt={item.partnerName} className="partner-logo" />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      )}

      {/* Table of Partners */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="admin-table-wrapper glass-card-light">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Logos Preview</th>
                <th>Partner Name</th>
                <th>Website URL</th>
                <th style={{ width: '80px' }}>Order</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.length > 0 ? (
                partners.map((partner) => {
                  const logos = partner.logos && partner.logos.length > 0
                    ? partner.logos
                    : (partner.logo ? [partner.logo] : []);

                  return (
                    <tr key={partner._id}>
                      <td>
                        <div className="partner-table-logos">
                          {logos.slice(0, 4).map((imgUrl, i) => (
                            <img
                              key={`${partner._id}-${i}`}
                              src={imgUrl}
                              alt={partner.name}
                              className="partner-table-logo-thumb"
                            />
                          ))}
                          {logos.length > 4 && (
                            <span className="partner-table-logo-more">+{logos.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{partner.name}</strong>
                        <div className="text-xs text-muted">{logos.length} logo{logos.length === 1 ? '' : 's'} attached</div>
                      </td>
                      <td>
                        {partner.url ? (
                          <a
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="partner-external-link"
                          >
                            {partner.url}
                          </a>
                        ) : (
                          <span className="text-muted">–</span>
                        )}
                      </td>
                      <td>{partner.order}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEditModal(partner)}
                            aria-label="Edit partner"
                            title="Edit"
                          >
                            <HiPencilSquare />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setDeleteConfirm(partner)}
                            aria-label="Delete partner"
                            title="Delete"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2.5rem' }}>
                    No partner logos added yet. Click <strong>"Add Partner Batch"</strong> to upload logos from your local PC.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal with Multi-File Upload & Thumbnail Grid */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-content glass-card-light"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingItem ? 'Edit Partner & Logos' : 'Add Partner & Logos Batch'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="partner-name">
                  Partner / Company Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="partner-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thermo Fisher Scientific, Agilent, Merck"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="partner-website">
                    Website URL (Optional)
                  </label>
                  <input
                    id="partner-website"
                    type="url"
                    className="form-input"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="partner-order">
                    Display Order
                  </label>
                  <input
                    id="partner-order"
                    type="number"
                    className="form-input"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Local File Upload Section */}
              <div className="form-group">
                <div className="image-upload-header">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Logos ({logosQueue.length} selected) <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <span className="text-xs text-muted">Select multiple image files from local PC</span>
                </div>

                {/* Thumbnail Preview Grid */}
                {logosQueue.length > 0 && (
                  <div className="partner-thumb-grid">
                    {logosQueue.map((item) => (
                      <div key={item.id} className="partner-thumb-card glass-card-light">
                        <div className="partner-thumb-img-wrapper">
                          <img src={item.preview || item.url} alt="Logo thumbnail" />
                        </div>
                        <button
                          type="button"
                          className="partner-thumb-remove-btn"
                          onClick={() => removeLogo(item.id)}
                          title="Remove from batch"
                          aria-label="Remove logo"
                        >
                          <HiXMark />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone with multiple selection */}
                <div
                  className={`image-drop-zone ${dragActive ? 'image-drop-zone--active' : ''} ${
                    isUploading ? 'image-drop-zone--uploading' : ''
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />

                  {isUploading ? (
                    <div className="image-uploading-state">
                      <HiOutlineArrowPath className="spinner" style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }} />
                      <p className="image-uploading-text">Uploading logos to cloud storage... {uploadProgress}%</p>
                      <div className="upload-progress-track">
                        <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="image-drop-content">
                      <HiOutlineCloudArrowUp className="image-drop-icon" />
                      <p className="image-drop-text">
                        <strong>Click to choose multiple logos</strong> or drag & drop images here
                      </p>
                      <p className="image-drop-subtext">PNG, SVG, JPG, WebP supported with transparent backgrounds</p>
                    </div>
                  )}
                </div>
              </div>

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
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? 'Saving Partner...' : (editingItem ? 'Update Partner' : 'Save Partner & Logos')}
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
            <h3 style={{ marginBottom: '0.75rem' }}>Delete Partner</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong> and all its associated logos? This action cannot be undone.
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
