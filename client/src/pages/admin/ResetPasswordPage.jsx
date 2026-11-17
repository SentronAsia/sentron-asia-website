import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../api/services';
import SEOHead from '../../components/shared/SEOHead.jsx';
import { notify } from '../../components/shared/toastService.js';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      notify('Password reset successfully. Please login.', 'success');
      navigate('/admin/login');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    mutation.mutate({ token, password });
  };

  return (
    <>
      <SEOHead title="Reset Password" noindex />
      <div className="admin-login-page">
        <div className="admin-login-card glass-card-light">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem' }}>Reset Password</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {(errorMsg || mutation.isError) && (
              <div className="form-error" style={{ textAlign: 'center' }}>
                {errorMsg || mutation.error?.response?.data?.message || 'An error occurred. Please try again.'}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Resetting...' : 'Reset Password'}
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
