import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress ResizeObserver error in development
if (process.env.NODE_ENV === 'development') {
  const errorHandler = (e: ErrorEvent) => {
    if (e.message?.includes('ResizeObserver')) {
      e.stopImmediatePropagation();
    }
  };
  window.addEventListener('error', errorHandler);
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);