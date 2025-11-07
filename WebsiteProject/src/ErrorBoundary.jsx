import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log detailed error information to console for production debugging
    console.error('=== PRODUCTION ERROR CAUGHT ===');
    console.error('Error:', error);
    console.error('Error type:', typeof error);
    console.error('Error string:', String(error));
    console.error('Stack:', error?.stack || 'No stack');
    console.error('Component Stack:', errorInfo?.componentStack);
    console.error('================================');
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#9e4b13' }}>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please refresh the page to try again.</p>
          <details style={{ 
            marginTop: '20px', 
            padding: '10px', 
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Technical Details (for developers)
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#fff',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {String(this.state.error)}
              {this.state.error?.stack}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#9e4b13',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
