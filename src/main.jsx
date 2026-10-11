import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SiteTextsProvider } from './content/SiteTexts.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteTextsProvider>
      <App />
    </SiteTextsProvider>
  </React.StrictMode>,
)
