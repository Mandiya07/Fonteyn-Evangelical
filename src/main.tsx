/// <reference types="vite/client" />
import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to capture unhandled runtime errors, resource loading failures, and unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Check if this is an asset load error (e.g. stylesheet, script) or a runtime script execution error
    const target = event.target as any;
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')) {
      const url = target.src || target.href;
      console.error(`[Global Resource Load Error] Failed to load resource from URL: ${url}`, {
        tagName: target.tagName,
        outerHTML: target.outerHTML
      });
    } else {
      console.error('[Global Runtime Error] Captured unhandled exception:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }
  }, true); // Use capture phase to intercept resource loading errors (which do not bubble)

  window.addEventListener('unhandledrejection', (event) => {
    // Extract a clear error message
    const reason = event.reason;
    const message = reason instanceof Error 
      ? `${reason.name}: ${reason.message}\n${reason.stack || ''}`
      : typeof reason === 'object' && reason !== null
        ? JSON.stringify(reason)
        : String(reason);

    // Ignore or warn about known benign/environment/extension errors to prevent test pollution
    const isBenign = 
      !reason ||
      message.includes('ServiceWorker') ||
      message.includes('Service Worker') ||
      message.includes('service worker') ||
      message.includes('sw.js') ||
      message.includes('extension') ||
      message.includes('Extension') ||
      message.includes('AbortError') ||
      message.includes('Failed to fetch') ||
      message.includes('ResizeObserver') ||
      message.includes('NotAllowedError') ||
      message.includes('autoplay') ||
      message.includes('play()');

    if (isBenign) {
      console.warn('[Global Unhandled Rejection] Ignored benign promise rejection:', message);
    } else {
      console.error(`[Global Unhandled Rejection] Captured unhandled promise rejection: ${message}`);
    }
  });
}

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  props: {children: ReactNode};
  state = { hasError: false, error: null as Error | null };

  constructor(props: {children: ReactNode}) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffe6e6', color: '#cc0000', fontFamily: 'monospace' }}>
          <h2>Something went wrong in the React App.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register Service Worker in production to enable offline caching for unstable Eswatini networks
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PWA ServiceWorker registered successfully with scope: ', registration.scope);
      })
      .catch((error) => {
        console.error('PWA ServiceWorker registration failed: ', error);
      });
  });
}

