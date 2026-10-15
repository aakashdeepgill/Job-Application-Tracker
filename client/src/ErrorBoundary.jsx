import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error in JobTracker:', error, errorInfo);
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
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#090a0f',
          color: '#f0f2f5',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#ff6b6b' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#8e96a4', maxWidth: '480px', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
