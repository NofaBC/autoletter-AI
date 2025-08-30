import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Suppress ResizeObserver errors in development
if (process.env.NODE_ENV === 'development') {
  const BLOCK = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications'
  ];
  const onError = (e: ErrorEvent) => {
    const msg = e?.message || '';
    if (BLOCK.some(t => msg.includes(t))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  window.addEventListener('error', onError, true); // capture phase
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);