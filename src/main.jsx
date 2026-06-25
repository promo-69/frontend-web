import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingProvider } from './context/LoadingContext'

import { AuthProvider } from './context/AuthContext'
import { PurchaseProvider } from './context/PurchaseContext'

createRoot(document.getElementById('root')).render(
  <LoadingProvider>
    <AuthProvider>
      <PurchaseProvider>
        <App />
      </PurchaseProvider>
    </AuthProvider>
  </LoadingProvider>
)
