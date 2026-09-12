import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Root Access Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#070b13',
          color: '#f43f5e',
          fontFamily: 'monospace',
          padding: '30px',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ color: '#06b6d4', fontSize: '20px', marginBottom: '10px' }}>
            [!] ROOT ACCESS // SYSTEM ERROR DETECTED
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
            An unexpected error interrupted the forensic shell initialization:
          </p>
          <pre style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            padding: '16px',
            borderRadius: '8px',
            color: '#fda4af',
            fontSize: '12px',
            overflowX: 'auto',
            marginBottom: '20px'
          }}>
            {this.state.error?.toString()}
            {'\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              backgroundColor: '#06b6d4',
              color: '#070b13',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Clear Local Cache & Restart
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
