import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Polyfill `global` for dependencies that expect Node global in browser builds
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  ;(window as any).global = window
}

import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
