import { useState, useRef, useCallback } from 'react';
import {
  HiOutlineCloudArrowUp,
  HiXMark,
  HiOutlinePlus,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { uploadMultipleFiles } from '../../api/services';

/**
 * MultiImageUploadField — Multiple image uploader with preview thumbnail grid,
 * individual remove "X" buttons, batch drag-and-drop, progress tracking,
 * and support for both existing URLs and local file queue.
 *
 * Props:
 *   values: string[] (array of image URLs or data URIs)
 *   onChange: (urls: string[]) => void
 *   label?: string
 *   maxFiles?: number
 */
export default function MultiImageUploadField({
  values = [],
  onChange,
  label = 'Partner Logos',
  maxFiles = 20,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const incomingFiles = Array.from(filesList).filter((f) => f.type.startsWith('image/'));

    if (incomingFiles.length === 0) {
      setError('Please select valid image files.');
      return;
    }

    if (values.length + incomingFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed.`);
    }

    const filesToUpload = incomingFiles.slice(0, maxFiles - values.length);
    setError('');
    setUploading(true);
    setProgress(15);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });

      const onProgress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      const res = await uploadMultipleFiles(formData, onProgress);
      const newUrls = res?.urls || (res?.url ? [res.url] : (Array.isArray(res?.data) ? res.data.map(d => d.url) : []));

      if (newUrls.length > 0) {
        onChange([...values, ...newUrls]);
      } else {
        throw new Error('No URLs returned from upload.');
      }
    } catch (err) {
      console.warn('Backend batch upload failed; generating client-side fallback data URLs:', err);
      // Read all files as Data URLs in parallel
      const dataUrlPromises = filesToUpload.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });

      const dataUrls = await Promise.all(dataUrlPromises);
      onChange([...values, ...dataUrls]);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [values, onChange, maxFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleRemove = (indexToRemove) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="form-group multi-image-upload-field">
      <div className="image-upload-header">
        <label className="form-label" style={{ marginBottom: 0 }}>
          {label} ({values.length} uploaded)
        </label>
        <span className="text-xs text-muted">Up to {maxFiles} files</span>
      </div>

      {/* Thumbnail Preview Grid */}
      {values.length > 0 && (
        <div className="multi-image-grid">
          {values.map((url, index) => (
            <div key={`${url.slice(0, 30)}-${index}`} className="multi-image-card glass-card-light">
              <div className="multi-image-thumb">
                <img src={url} alt={`Thumbnail ${index + 1}`} />
              </div>
              <button
                type="button"
                className="multi-image-remove-btn"
                onClick={() => handleRemove(index)}
                title="Remove logo"
                aria-label={`Remove logo ${index + 1}`}
              >
                <HiXMark />
              </button>
            </div>
          ))}

          {/* Add more button in grid */}
          {values.length < maxFiles && !uploading && (
            <button
              type="button"
              className="multi-image-add-more glass-card-light"
              onClick={() => fileInputRef.current?.click()}
              title="Add more files"
            >
              <HiOutlinePlus className="multi-image-add-icon" />
              <span>Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Drag and Drop Zone */}
      {values.length < maxFiles && (
        <div
          className={`image-drop-zone multi-drop-zone ${dragActive ? 'image-drop-zone--active' : ''} ${
            uploading ? 'image-drop-zone--uploading' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {uploading ? (
            <div className="image-uploading-state">
              <HiOutlineArrowPath className="spinner" style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }} />
              <p className="image-uploading-text">Uploading files to cloud... {progress}%</p>
              <div className="upload-progress-track">
                <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="image-drop-content">
              <HiOutlineCloudArrowUp className="image-drop-icon" />
              <p className="image-drop-text">
                <strong>Click to browse multiple files</strong> or drag & drop logos here
              </p>
              <p className="image-drop-subtext">Hold Ctrl/Cmd or Shift to select multiple logos at once</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="form-error-msg">{error}</p>}
    </div>
  );
}
