import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineCloudArrowUp, HiOutlineTrash, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import {
  adminFetchMedia, adminUploadMedia,
  adminUpdateMedia, adminDeleteMedia,
} from '../../api/services';

export default function MediaLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [editingMedia, setEditingMedia] = useState(null);
  const [altText, setAltText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ['admin-media', { search }],
    queryFn: () => adminFetchMedia({ search }),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ formData, onProgress }) => adminUploadMedia(formData, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setUploadProgress({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminUpdateMedia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setEditingMedia(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setDeleteConfirm(null);
    },
  });

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files).slice(0, 10); // Max 10 files
    if (files.length > 10) {
      alert('Maximum 10 files per upload. Only the first 10 will be uploaded.');
    }

    const formData = new FormData();
    fileArray.forEach((file) => formData.append('files', file));

    const onProgress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress((prev) => ({ ...prev, total: percent }));
      }
    };

    uploadMutation.mutate({ formData, onProgress });
  }, [uploadMutation]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 style={{ fontSize: '1.5rem' }}>Media Library</h1>
      </div>

      {/* Upload Zone */}
      <div
        className={`media-dropzone ${dragActive ? 'media-dropzone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        onClick={() => document.getElementById('media-file-input').click()}
      >
        <HiOutlineCloudArrowUp style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-accent)' }} />
        <p style={{ fontWeight: 500, marginTop: '0.5rem' }}>
          {uploadMutation.isPending ? `Uploading to cloud... ${uploadProgress.total || 0}%` : 'Drag & drop files or click to browse'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Maximum 10 files per batch</p>
        {uploadMutation.isPending && (
          <div className="upload-progress-track" style={{ width: '80%', maxWidth: '300px', marginTop: '0.75rem' }}>
            <div className="upload-progress-fill" style={{ width: `${uploadProgress.total || 0}%` }} />
          </div>
        )}
        <input
          type="file"
          id="media-file-input"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '320px', margin: '1.5rem 0' }}>
        <HiOutlineMagnifyingGlass style={{
          position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)', width: '1rem', height: '1rem',
        }} />
        <input
          type="search"
          placeholder="Search media..."
          className="form-input"
          style={{ paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : (
        <div className="media-grid">
          {media?.data?.map((item) => (
            <div key={item._id} className="media-card glass-card-light">
              <div className="media-card-preview">
                {item.mimeType?.startsWith('image/') ? (
                  <img src={item.url} alt={item.altText || item.filename} />
                ) : (
                  <div className="media-card-file-icon">
                    <span>{item.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                  </div>
                )}
              </div>
              <div className="media-card-info">
                <p className="media-card-name" title={item.filename}>{item.filename}</p>
                <p className="media-card-meta">{item.altText || 'No alt text'}</p>
              </div>
              <div className="media-card-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditingMedia(item); setAltText(item.altText || ''); }}
                >
                  Edit Alt
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={() => setDeleteConfirm(item)}
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
          {(!media?.data || media.data.length === 0) && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
              No media files found. Upload some files to get started.
            </div>
          )}
        </div>
      )}

      {/* Edit Alt Text Modal */}
      {editingMedia && (
        <div className="modal-backdrop" onClick={() => setEditingMedia(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Edit Alt Text</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              {editingMedia.filename}
            </p>
            <div className="form-group">
              <label className="form-label">Alt Text</label>
              <input className="form-input" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe this image..." />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-ghost" onClick={() => setEditingMedia(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ id: editingMedia._id, data: { altText } })}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.75rem' }}>Delete Media</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Delete "{deleteConfirm.filename}"? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm._id)}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
