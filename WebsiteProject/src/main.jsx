import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'        // ← relative, no leading slash
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'               // ← relative

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// The #static-content SEO pre-render block (injected per-route by the CF Pages
// middleware, visually hidden) duplicates the page's <h1> once React renders
// its own. Rendering crawlers (Bing/Google execute JS) would otherwise see two
// <h1> tags per page. Remove it as soon as the app has mounted — plain-HTML
// crawlers still get the block in full from the initial response.
document.getElementById('static-content')?.remove()