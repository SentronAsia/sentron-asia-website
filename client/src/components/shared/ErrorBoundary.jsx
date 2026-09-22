import { Component } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--color-bg)'
        }}>
          <HiExclamationTriangle style={{ width: '4rem', height: '4rem', color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '600px' }}>
            We've encountered an unexpected error. Please try refreshing the page, or contact support if the issue persists.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
              Go to Home
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div style={{ marginTop: '3rem', textAlign: 'left', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', maxWidth: '800px', overflowX: 'auto' }}>
              <p style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{this.state.error.toString()}</p>
              <pre style={{ fontSize: '0.875rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}
