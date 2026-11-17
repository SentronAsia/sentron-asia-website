import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../../api/services';
import SEOHead from '../../components/shared/SEOHead.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      setSuccessMsg(data.message || 'Reset link sent.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    mutation.mutate({ email });
  };

  return (
    <>
      <SEOHead title="Forgot Password" noindex />
      <div className="admin-login-page">
        <div className="admin-login-card glass-card-light">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem' }}>Forgot Password</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="admin@sentronasia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {mutation.isError && (
              <div className="form-error" style={{ textAlign: 'center' }}>
                {mutation.error?.response?.data?.message || 'An error occurred. Please try again.'}
              </div>
            )}
            
            {successMsg && (
              <div style={{ color: 'var(--color-success)', textAlign: 'center', fontSize: '0.875rem' }}>
                {successMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={mutation.isPending || !!successMsg}
            >
              {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/admin/login" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
