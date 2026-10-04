import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';


class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[RootErrorBoundary] Crash caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#1c241e', color: '#fff', padding: '40px 24px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', background: '#252f27', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h1 style={{ color: '#faeed4', fontSize: '22px', margin: '0 0 12px 0' }}>IYMPACK</h1>
            <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '0 0 16px 0' }}>Terjadi kendala saat memuat halaman:</p>
            <pre style={{ background: '#171e19', color: '#fca5a5', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString()}
              {'\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ marginTop: '20px', padding: '12px 24px', background: '#faeed4', color: '#1c241e', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Bersihkan Cache & Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Render React application immediately (0ms visual delay)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);

