import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../../api/services';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ThemeToggle from '../../components/shared/ThemeToggle.jsx';

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
      <div className="login-page">
        <div className="login-top-bar">
          <ThemeToggle />
        </div>
        
        <div className="login-card glass-card-light">
          <div className="login-header">
            <h1 className="login-title">Forgot Password</h1>
            <p className="login-subtitle">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
