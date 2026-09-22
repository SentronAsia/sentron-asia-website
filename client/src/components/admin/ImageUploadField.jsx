import { useState, useRef, useCallback } from 'react';
import {
  HiOutlineCloudArrowUp,
  HiOutlinePhoto,
  HiOutlineLink,
  HiXMark,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { uploadSingleFile } from '../../api/services';

/**
 * ImageUploadField — Single image uploader with local file upload, drag-and-drop,
 * progress indicator, thumbnail preview, and URL mode toggle.
 *
 * Props:
 *   value: string (image URL or data URI)
 *   onChange: (url: string) => void
 *   label?: string
 *   placeholder?: string
 *   required?: boolean
 */
export default function ImageUploadField({
  value = '',
  onChange,
  label = 'Image',
  placeholder = 'https://...',
  required = false,
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, SVG, etc.).');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const onProgress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      const res = await uploadSingleFile(formData, onProgress);
      if (res?.url) {
        onChange(res.url);
      } else if (res?.data?.url) {
        onChange(res.data.url);
      }
    } catch (err) {
      console.warn('Backend upload failed, using client-side fallback data URL:', err);
      // Client-side fallback so admin work is never blocked even if server is offline
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
  };

  return (
    <div className="form-group image-upload-field">
      <div className="image-upload-header">
        <label className="form-label" style={{ marginBottom: 0 }}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
        <div className="image-mode-toggle">
          <button
            type="button"
            className={`image-mode-btn ${mode === 'upload' ? 'image-mode-btn--active' : ''}`}
            onClick={() => setMode('upload')}
          >
            <HiOutlinePhoto /> Upload File
          </button>
          <button
            type="button"
            className={`image-mode-btn ${mode === 'url' ? 'image-mode-btn--active' : ''}`}
            onClick={() => setMode('url')}
          >
            <HiOutlineLink /> Image URL
          </button>
        </div>
      </div>

      {/* Preview Thumbnail If Image Exists */}
      {value ? (
        <div className="image-preview-card glass-card-light">
          <div className="image-preview-thumb">
            <img src={value} alt="Preview" />
          </div>
          <div className="image-preview-details">
            <span className="image-preview-path" title={value}>
              {value.startsWith('data:') ? 'Local file (buffered)' : value}
            </span>
            <div className="image-preview-actions">
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  if (mode === 'upload' && fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    setMode('url');
                  }
                }}
              >
                Change
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-danger-text"
                onClick={handleClear}
                title="Remove image"
              >
                <HiXMark /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {mode === 'upload' ? (
            <div
              className={`image-drop-zone ${dragActive ? 'image-drop-zone--active' : ''} ${
                uploading ? 'image-drop-zone--uploading' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {uploading ? (
                <div className="image-uploading-state">
                  <HiOutlineArrowPath className="spinner" style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }} />
                  <p className="image-uploading-text">Uploading to cloud... {progress}%</p>
                  <div className="upload-progress-track">
                    <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="image-drop-content">
                  <HiOutlineCloudArrowUp className="image-drop-icon" />
                  <p className="image-drop-text">
                    <strong>Click to browse</strong> or drag & drop image here
                  </p>
                  <p className="image-drop-subtext">PNG, JPG, WebP, SVG up to 10MB</p>
                </div>
              )}
            </div>
          ) : (
            <div className="image-url-input-wrap">
              <input
                type="url"
                className="form-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required && !value}
              />
            </div>
          )}
        </>
      )}

      {error && <p className="form-error-msg">{error}</p>}
    </div>
  );
}
