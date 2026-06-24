/**
 * main.jsx — DevSync application entry point.
 *
 * This file does exactly three things:
 *   1. Imports global styles
 *   2. Mounts the React app into the DOM
 *   3. Wraps in StrictMode for development-time warnings
 *
 * Nothing else belongs here.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles — must be imported before App so base styles apply first
import './index.css'

import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
