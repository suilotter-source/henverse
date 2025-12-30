import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// small global polyfill if needed
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  ;(window as any).global = window
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
