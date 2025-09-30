import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'        // ← relative, no leading slash
import './index.css'               // ← relative

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)