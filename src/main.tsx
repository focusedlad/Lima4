import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

class StartupErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Lima4 render failure:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: '32px 20px', background: '#FBFCFD', color: '#243746', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 640, margin: '8vh auto', padding: 24, border: '1px solid #D5E5EE', borderRadius: 20, background: '#fff' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Lima4 hit a loading error</h1>
            <p style={{ lineHeight: 1.6 }}>Your account and saved data have not been deleted. Reload the page once. If this message returns, send the error details below to support so the issue can be fixed.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 12, borderRadius: 10, background: '#F1F5F9', fontSize: 12 }}>{this.state.error.message}</pre>
            <button onClick={() => window.location.reload()} style={{ padding: '12px 18px', borderRadius: 10, background: '#71313B', color: '#fff', fontWeight: 600 }}>Reload Lima4</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StartupErrorBoundary>
      <App />
    </StartupErrorBoundary>
  );
} else {
  document.body.innerHTML = '<main style="font:16px system-ui;padding:32px;color:#243746">Lima4 could not start because its app container is missing. Please reload the page.</main>';
}
