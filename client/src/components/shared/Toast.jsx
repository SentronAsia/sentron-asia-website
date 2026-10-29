import { useState, useEffect } from 'react';
import { HiCheckCircle, HiExclamationTriangle, HiXMark } from 'react-icons/hi2';
import { registerToastListener } from './toastService.js';

export default function ToastContainer() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    return registerToastListener((t) => {
      setToast(t);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="toast-portal" role="alert" aria-live="assertive">
      <div className={`toast-card glass-panel-light ${isError ? 'toast-card--error' : 'toast-card--success'}`}>
        {isError ? (
          <HiExclamationTriangle className="toast-icon toast-icon--error" />
        ) : (
          <HiCheckCircle className="toast-icon toast-icon--success" />
        )}
        <span className="toast-message">{toast.message}</span>
        <button
          onClick={() => setToast(null)}
          className="toast-close"
          aria-label="Close notification"
        >
          <HiXMark />
        </button>
      </div>
    </div>
  );
}
